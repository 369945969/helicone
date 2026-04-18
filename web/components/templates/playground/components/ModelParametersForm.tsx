import useNotification from "@/components/shared/notification/useNotification";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { logger } from "@/lib/telemetry/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getJawnClient } from "@/lib/clients/jawn";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InfoIcon, PencilIcon, Settings2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import ResponseFormatModal from "./ResponseFormatModal";
import {
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { providers } from "@/data/providers";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { ModelParameters } from "@/lib/api/llm/generate";
import { ResponseFormat, ResponseFormatType } from "../types";

interface ModelParametersFormProps {
  isScrolled: boolean;
  parameters: ModelParameters;
  onParametersChange: (_parameters: ModelParameters) => void;
  responseFormat: ResponseFormat;
  onResponseFormatChange: (_responseFormat: ResponseFormat) => void;
  error: string | null;
}

export default function ModelParametersForm({
  isScrolled,
  parameters = {
    temperature: undefined,
    max_tokens: undefined,
    top_p: undefined,
    frequency_penalty: undefined,
    presence_penalty: undefined,
    stop: undefined,
    reasoning_effort: undefined,
    verbosity: undefined,
  },
  onParametersChange,
  responseFormat,
  onResponseFormatChange,
  error,
}: ModelParametersFormProps) {
  const updateParameter = (key: keyof ModelParameters, value: any) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    });
  };

  const toggleDefault = (key: keyof ModelParameters) => {
    onParametersChange({
      ...parameters,
      [key]: parameters[key] === undefined ? 0 : undefined,
    });
  };

  const [isModelParametersPopoverOpen, setIsModelParametersPopoverOpen] =
    useState(false);
  const [isResponseFormatModalOpen, setIsResponseFormatModalOpen] =
    useState(false);

  const { setNotification } = useNotification();
  const queryClient = useQueryClient();

  const { mutate: setPlaygroundRequestsThroughHelicone, isPending } =
    useMutation({
      mutationKey: ["playground-requests"],
      mutationFn: async ({
        requestsThroughHelicone,
      }: {
        requestsThroughHelicone: boolean;
      }) => {
        const jawn = getJawnClient();
        const { error } = await jawn.POST(
          "/v1/playground/requests-through-helicone",
          {
            body: {
              requestsThroughHelicone,
            },
          },
        );

        if (error) {
          setNotification("更新测试台设置失败", "error");
        } else {
          setNotification("测试台设置已更新", "success");
        }
      },
      onMutate: ({ requestsThroughHelicone }) => {
        queryClient.setQueryData(
          ["playground-requests-through-helicone"],
          requestsThroughHelicone,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["playground-requests-through-helicone"],
        });
      },
    });

  const { data: requestsThroughHelicone } = useQuery({
    queryKey: ["playground-requests-through-helicone"],
    queryFn: async () => {
      const jawn = getJawnClient();
      const { data } = await jawn.GET(
        "/v1/playground/requests-through-helicone",
      );
      return data?.data ?? false;
    },
  });

  const [isProviderKeyDialogOpen, setIsProviderKeyDialogOpen] = useState(false);

  // Auto-open provider key dialog when rate limit error occurs
  useEffect(() => {
    if (
      error &&
      (error.includes("Insufficient credits") ||
        (error.includes("No") && error.includes("API key found")))
    ) {
      logger.info({ error }, "Provider key error occurred, opening dialog");
      setIsProviderKeyDialogOpen(true);
    }
  }, [error]);

  return (
    <>
      <Popover
        open={isModelParametersPopoverOpen}
        onOpenChange={setIsModelParametersPopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 border-none",
              isScrolled &&
                "bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900",
            )}
          >
            <Settings2Icon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-2 w-96">
          <div className="flex w-full flex-col gap-4 py-4">
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    You will be able to see your playground requests on the
                    requests and dashboards page.
                  </TooltipContent>
                </Tooltip>
                <Label htmlFor="requests-through-helicone" className="text-sm">
                  Log playground requests
                </Label>
                <Switch
                  className="data-[state=checked]:bg-foreground"
                  size="sm"
                  variant="helicone"
                  id="requests-through-helicone"
                  checked={requestsThroughHelicone ?? false}
                  onCheckedChange={(checked) => {
                    setPlaygroundRequestsThroughHelicone({
                      requestsThroughHelicone: checked,
                    });
                  }}
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="responseFormat">响应格式</Label>
                </div>
                {responseFormat.type === "json_schema" && (
                  <PencilIcon
                    onClick={() => setIsResponseFormatModalOpen(true)}
                    className="mr-2 h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                  />
                )}
              </div>
              <Select
                onValueChange={(value) => {
                  if (value === "json_schema") {
                    setIsResponseFormatModalOpen(true);
                  } else {
                    onResponseFormatChange({
                      type: value as ResponseFormatType,
                      json_schema: undefined,
                    });
                  }
                }}
                value={responseFormat.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="响应格式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="json_schema">JSON Schema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="temperature">温度</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      控制随机性：较低的值更具确定性，较高的值更随机。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="temperature-default"
                    checked={parameters.temperature === undefined}
                    onCheckedChange={() => toggleDefault("temperature")}
                  />
                  <Label htmlFor="temperature-default">使用默认值</Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[parameters.temperature ?? 0]}
                  onValueChange={([value]) =>
                    updateParameter("temperature", value)
                  }
                  className="flex-1"
                  disabled={parameters.temperature === undefined}
                />
                <Input
                  type="number"
                  value={parameters.temperature ?? 0}
                  onChange={(e) =>
                    updateParameter("temperature", parseFloat(e.target.value))
                  }
                  className="w-20"
                  min={0}
                  max={2}
                  step={0.1}
                  disabled={parameters.temperature === undefined}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="max_tokens">最大令牌数</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      响应中生成的最大令牌数。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="max_tokens-default"
                    checked={parameters.max_tokens === undefined}
                    onCheckedChange={() => toggleDefault("max_tokens")}
                  />
                  <Label htmlFor="max_tokens-default">使用默认值</Label>
                </div>
              </div>
              <Input
                id="max_tokens"
                type="number"
                value={parameters.max_tokens ?? 0}
                onChange={(e) =>
                  updateParameter("max_tokens", parseInt(e.target.value))
                }
                min={1}
                disabled={parameters.max_tokens === undefined}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="top_p">Top P（核采样）</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      通过核采样控制多样性：0.5 表示考虑一半所有可能性加权选项。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="top_p-default"
                    checked={parameters.top_p === undefined}
                    onCheckedChange={() => toggleDefault("top_p")}
                  />
                  <Label htmlFor="top_p-default">使用默认值</Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="top_p"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[parameters.top_p ?? 0]}
                  onValueChange={([value]) => updateParameter("top_p", value)}
                  className="flex-1"
                  disabled={parameters.top_p === undefined}
                />
                <Input
                  type="number"
                  value={parameters.top_p ?? 0}
                  onChange={(e) =>
                    updateParameter("top_p", parseFloat(e.target.value))
                  }
                  className="w-20"
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={parameters.top_p === undefined}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="frequency_penalty">频率惩罚</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      根据频率减少令牌序列的重复。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="frequency_penalty-default"
                    checked={parameters.frequency_penalty === undefined}
                    onCheckedChange={() => toggleDefault("frequency_penalty")}
                  />
                  <Label htmlFor="frequency_penalty-default">使用默认值</Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="frequency_penalty"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={[parameters.frequency_penalty ?? 0]}
                  onValueChange={([value]) =>
                    updateParameter("frequency_penalty", value)
                  }
                  className="flex-1"
                  disabled={parameters.frequency_penalty === undefined}
                />
                <Input
                  type="number"
                  value={parameters.frequency_penalty ?? 0}
                  onChange={(e) =>
                    updateParameter(
                      "frequency_penalty",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-20"
                  min={-2}
                  max={2}
                  step={0.1}
                  disabled={parameters.frequency_penalty === undefined}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="presence_penalty">存在惩罚</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      根据令牌序列在文本中的出现减少重复。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="presence_penalty-default"
                    checked={parameters.presence_penalty === undefined}
                    onCheckedChange={() => toggleDefault("presence_penalty")}
                  />
                  <Label htmlFor="presence_penalty-default">使用默认值</Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="presence_penalty"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={[parameters.presence_penalty ?? 0]}
                  onValueChange={([value]) =>
                    updateParameter("presence_penalty", value)
                  }
                  className="flex-1"
                  disabled={parameters.presence_penalty === undefined}
                />
                <Input
                  type="number"
                  value={parameters.presence_penalty ?? 0}
                  onChange={(e) =>
                    updateParameter(
                      "presence_penalty",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-20"
                  min={-2}
                  max={2}
                  step={0.1}
                  disabled={parameters.presence_penalty === undefined}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="stop">停止序列</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      API 将停止生成更多令牌的序列。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stop-default"
                    checked={parameters.stop === undefined}
                    onCheckedChange={() => toggleDefault("stop")}
                  />
                  <Label htmlFor="stop-default">使用默认值</Label>
                </div>
              </div>
              <Input
                id="stop"
                value={parameters.stop ?? ""}
                onChange={(e) => updateParameter("stop", e.target.value)}
                placeholder="输入停止序列，用逗号分隔"
                disabled={parameters.stop === undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="reasoning_effort">推理努力程度</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      仅适用于推理模型。指导模型在创建提示响应之前生成多少推理令牌。
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Select
                onValueChange={(value) => {
                  updateParameter(
                    "reasoning_effort",
                    value === "none" ? undefined : value,
                  );
                }}
                value={parameters.reasoning_effort ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="推理力度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="minimal">最小</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* TODO: Add verbosity back in when it starts working with openrouter */}
            {/* <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="verbosity">详细程度</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      仅适用于推理模型。让您提示模型在回复中更或更少扩展。
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Select
                onValueChange={(value) => {
                  updateParameter(
                    "verbosity",
                    value === "none" ? undefined : value,
                  );
                }}
                value={parameters.verbosity ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="详细程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <Dialog
              open={isProviderKeyDialogOpen}
              onOpenChange={setIsProviderKeyDialogOpen}
            >
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>配置 OpenRouter</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-sm text-muted-foreground">
OpenRouter 通过单个 API 提供对多个 LLM 模型的访问。设置您的 OpenRouter API 密钥以解锁提示编辑器中的所有可用模型。
                </div>
                <ProviderCard
                  provider={providers.find((p) => p.id === "openrouter")!}
                />
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
      <ResponseFormatModal
        open={isResponseFormatModalOpen}
        setOpen={setIsResponseFormatModalOpen}
        responseFormat={responseFormat.json_schema ?? ""}
        onResponseFormatChange={(format) =>
          onResponseFormatChange({
            type: format ? "json_schema" : "text",
            json_schema: format ? format : undefined,
          })
        }
      />
    </>
  );
}
