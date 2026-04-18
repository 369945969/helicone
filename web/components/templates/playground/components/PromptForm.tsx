import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  InfoIcon,
  Check,
  ChevronsUpDown,
  Crown,
  SquareArrowOutUpRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  useGetPromptTags,
  useGetPromptEnvironments,
} from "@/services/hooks/prompts";
import TagsFilter from "@/components/templates/prompts2025/TagsFilter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PromptFormProps {
  isScrolled: boolean;
  saveAndVersion: boolean;
  onCreatePrompt: (tags: string[], promptName: string) => void;
  onSavePrompt: (
    newMajorVersion: boolean,
    environment: string | undefined,
    commitMessage: string,
  ) => void;
  autoOpen?: boolean;
}

export default function PromptForm({
  isScrolled,
  saveAndVersion,
  onCreatePrompt,
  onSavePrompt,
  autoOpen,
}: PromptFormProps) {
  const [promptName, setPromptName] = useState("");
  const [commitMessage, setCommitMessage] = useState("更新。");
  const [isPromptFormPopoverOpen, setIsPromptFormPopoverOpen] = useState(false);
  const [upgradeMajorVersion, setUpgradeMajorVersion] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<
    string | undefined
  >(undefined);
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState(false);
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState("");
  const [saveAsNewPrompt, setSaveAsNewPrompt] = useState(!saveAndVersion);

  const { data: existingTags = [], isLoading: isLoadingTags } =
    useGetPromptTags();

  const { data: environments = [], isLoading: isLoadingEnvironments } =
    useGetPromptEnvironments();

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const getAllTags = () => {
    const customTagsList = customTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    return Array.from(new Set([...selectedTags, ...customTagsList]));
  };

  return (
    <Popover
      open={isPromptFormPopoverOpen}
      onOpenChange={setIsPromptFormPopoverOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative border-none",
            isScrolled &&
              "bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900",
          )}
        >
          保存提示词
          {autoOpen && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="relative mr-2 w-96">
        <Link
          href="https://docs.helicone.ai/gateway/prompt-integration"
          target="_blank"
          className="absolute right-4 top-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          查看文档
          <SquareArrowOutUpRight className="h-3 w-3" />
        </Link>
        <div className="flex w-full flex-col gap-4 py-4">
          {saveAndVersion && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    创建新提示词而不是对当前提示词进行版本控制。
                  </TooltipContent>
                </Tooltip>
                <Label htmlFor="save-as-new-prompt" className="text-sm">
                  保存为新提示词
                </Label>
                <Switch
                  className="data-[state=checked]:bg-foreground"
                  size="sm"
                  variant="helicone"
                  id="save-as-new-prompt"
                  checked={saveAsNewPrompt}
                  onCheckedChange={setSaveAsNewPrompt}
                />
              </div>
            </div>
          )}

          {(!saveAndVersion || saveAsNewPrompt) && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="promptName">提示词名称</Label>
                </div>
                <Input
                  id="promptName"
                  value={promptName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPromptName(e.target.value)
                  }
                  placeholder="新提示词"
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label>Tags</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      添加标签以帮助组织和筛选您的提示词
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TagsFilter
                  tags={existingTags}
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                />
                <div className="mt-2 flex flex-col gap-2">
                  <Input
                    id="customTags"
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    placeholder="用逗号分隔的标签（例如：标签1, 标签2, 标签3）"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="commitMessage">提交信息</Label>
            </div>
            <Input
              id="commitMessage"
              value={commitMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCommitMessage(e.target.value)
              }
              placeholder="更新说明"
              className="w-full"
            />
          </div>

          {saveAndVersion && !saveAsNewPrompt && (
            <>
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      创建新主版本而不是增加次版本。
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="upgrade-major-version" className="text-sm">
                    升级主版本
                  </Label>
                  <Switch
                    className="data-[state=checked]:bg-foreground"
                    size="sm"
                    variant="helicone"
                    id="upgrade-major-version"
                    checked={upgradeMajorVersion}
                    onCheckedChange={setUpgradeMajorVersion}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label>Environment</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      选择现有环境或创建自定义环境。留空则不分配环境。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Popover
                  open={isEnvironmentOpen}
                  onOpenChange={setIsEnvironmentOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isEnvironmentOpen}
                      className="w-full justify-between"
                      disabled={isLoadingEnvironments}
                    >
                      {selectedEnvironment ||
                        customEnvironment ||
                        "选择环境（可选）"}
                      <ChevronsUpDown size={16} className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="搜索环境..." />
                      <CommandList>
                        <CommandEmpty>未找到环境。</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setSelectedEnvironment(undefined);
                              setCustomEnvironment("");
                              setIsEnvironmentOpen(false);
                            }}
                          >
                            <Check
                              size={16}
                              className={cn(
                                "mr-2",
                                !selectedEnvironment && !customEnvironment
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            无环境
                          </CommandItem>
                          {environments.map((env) => (
                            <CommandItem
                              key={env}
                              onSelect={() => {
                                setSelectedEnvironment(env);
                                setCustomEnvironment("");
                                setIsEnvironmentOpen(false);
                              }}
                            >
                              <Check
                                size={16}
                                className={cn(
                                  "mr-2",
                                  selectedEnvironment === env
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {env}
                              {env === "production" && (
                                <Crown className="ml-auto h-3 w-3 text-muted-foreground/50" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="mt-2 flex flex-col gap-2">
                  <Input
                    placeholder="或输入自定义环境名称..."
                    value={customEnvironment}
                    onChange={(e) => {
                      setCustomEnvironment(e.target.value);
                      if (e.target.value) {
                        setSelectedEnvironment(undefined);
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              if (!saveAndVersion || saveAsNewPrompt) {
                onCreatePrompt(getAllTags(), promptName);
              } else {
                onSavePrompt(
                  upgradeMajorVersion,
                  selectedEnvironment || customEnvironment,
                  commitMessage,
                );
              }
              setIsPromptFormPopoverOpen(false);
            }}
          >
            {!saveAndVersion || saveAsNewPrompt
              ? "创建提示"
              : "保存提示词"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
