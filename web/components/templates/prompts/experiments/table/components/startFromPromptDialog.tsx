import { use提示词Versions } from "../../../../../../services/hooks/prompts/prompts";
import { useState } from "react";
import { Select, SelectContent, SelectItem } from "../../../../../ui/select";
import { ScrollArea } from "../../../../../ui/scroll-area";
import { SelectTrigger, SelectValue } from "../../../../../ui/select";
import { 按钮 } from "../../../../../ui/button";
import { FileTextIcon } from "lucide-react";
import { 对话框, 对话框Content, 对话框Trigger } from "../../../../../ui/dialog";
import { BeakerIcon, PlusIcon } from "@heroicons/react/24/outline";
import useNotification from "../../../../../shared/notification/useNotification";
import { useJawnClient } from "../../../../../../lib/clients/jawnHook";
import { useRouter } from "next/router";
import 提示词Playground, { 提示词Object } from "../../../id/promptPlayground";
import { 输入 } from "../../../../../ui/input";
import LoadingAnimation from "../../../../../shared/loadingAnimation";

export const 新建实验对话框 = () => {
  const notification = useNotification();
  const [base提示词, setBase提示词] = useState<提示词Object>({
    model: "gpt-4",
    messages: [
      {
        id: "1",
        role: "system",
        content: "You are a helpful assistant.",
        _type: "message",
      },
    ],
  });

  const router = useRouter();
  const jawn = useJawnClient();

  const [selected输入, setSelected输入] = useState<any>({
    id: "",
    inputs: {},
    source_request: "",
    prompt_version: "",
    created_at: "",
    auto_prompt_inputs: [],
    response_body: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [promptName, set提示词Name] = useState<string>("");
  const [promptVariables, set提示词Variables] = useState<
    Array<{ original: string; heliconeTag: string; value: string }>
  >([]);

  const [inputs, set输入s] = useState<{ variable: string; value: string }[]>([
    { variable: "sectionTitle", value: "The universe" },
  ]);

  const handle输入Change = (
    index: number,
    field: "variable" | "value",
    newValue: string,
  ) => {
    const new输入s = [...inputs];
    new输入s[index][field] = newValue;
    set输入s(new输入s);
  };

  const add新建输入 = () => {
    set输入s([...inputs, { variable: "", value: "" }]);
  };

  const handle提示词Change = (new提示词: string | 提示词Object) => {
    setBase提示词(new提示词 as 提示词Object);
  };

  const handleCreate实验 = async () => {
    setIsLoading(true);
    if (!promptName || !base提示词) {
      notification.setNotification(
        "Please enter a prompt name and content",
        "error",
      );
      setIsLoading(false);
      return;
    }

    if (!base提示词.model) {
      notification.setNotification("请选择模型", "error");
      setIsLoading(false);
      return;
    }

    const res = await jawn.POST("/v1/prompt/create", {
      body: {
        userDefinedId: promptName,
        prompt: base提示词,
        metadata: {
          createdFromUi: true,
        },
      },
    });
    if (res.error || !res.data) {
      notification.setNotification("创建提示词失败", "error");
      setIsLoading(false);
      return;
    }

    if (!res.data?.data?.id || !res.data?.data?.prompt_version_id) {
      notification.setNotification("创建提示词失败", "error");
      setIsLoading(false);
      return;
    }

    const dataset = await jawn.POST("/v1/helicone-dataset", {
      body: {
        datasetName: "Dataset for 实验",
        requestIds: [],
      },
    });
    if (!dataset.data?.data?.datasetId) {
      notification.setNotification("创建数据集失败", "error");
      setIsLoading(false);
      return;
    }

    const experiment = await jawn.POST("/v1/experiment/new-empty", {
      body: {
        metadata: {
          prompt_id: res.data?.data?.id!,
          prompt_version: res.data?.data?.prompt_version_id!,
          experiment_name: `${promptName}_V1.0` || "",
        },
        datasetId: dataset.data?.data?.datasetId,
      },
    });
    if (!experiment.data?.data?.experimentId) {
      notification.setNotification("创建实验失败", "error");
      setIsLoading(false);
      return;
    }
    const result = await jawn.POST(
      "/v1/prompt/version/{promptVersionId}/subversion",
      {
        params: {
          path: {
            promptVersionId: res.data?.data?.prompt_version_id!,
          },
        },
        body: {
          newHeliconeTemplate: JSON.stringify(base提示词),
          isMajorVersion: false,
          metadata: {
            experimentAssigned: true,
          },
        },
      },
    );

    if (result.error || !result.data) {
      notification.setNotification("创建子版本失败", "error");
      setIsLoading(false);
      return;
    }

    notification.setNotification("提示词创建成功", "success");
    setIsLoading(false);
    await router.push(
      `/prompts/${res.data?.data?.id}/subversion/${res.data?.data?.prompt_version_id}/experiment/${experiment.data?.data?.experimentId}`,
    );
  };

  return (
    <对话框Content className="max-h-[80vh] w-full overflow-y-auto">
      {isLoading ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <LoadingAnimation />
          <h1 className="text-2xl font-semibold">获取您的实验</h1>
        </div>
      ) : (
        <div className="space-y-4 pr-8">
          <div className="flex flex-row space-x-2">
            <BeakerIcon className="h-6 w-6" />
            <h3 className="text-md font-semibold">原始提示词</h3>
          </div>

          <输入
            placeholder="提示词名称"
            value={promptName}
            onChange={(e) => set提示词Name(e.target.value)}
          />

          <提示词Playground
            prompt={base提示词}
            editMode={true}
            selected输入={selected输入}
            defaultEditMode={true}
            submitText={"Create 实验"}
            playgroundMode={"experiment"}
            handleCreate实验={handleCreate实验}
            is提示词CreatedFromUi={true}
            onExtract提示词Variables={(variables: any) =>
              set提示词Variables(
                variables.map((variable: any) => ({
                  original: variable.original,
                  heliconeTag: variable.heliconeTag,
                  value: variable.value,
                })),
              )
            }
            on提示词Change={handle提示词Change}
          />
        </div>
      )}
    </对话框Content>
  );
};

interface 开始From提示词对话框Props {
  prompts: {
    id: string;
    user_defined_id: string;
    description: string;
    pretty_name: string;
    created_at: string;
    major_version: number;
    metadata?: Record<string, any>;
  }[];
  on对话框Close: (open: boolean) => void;
}

export const 开始From提示词对话框 = ({
  prompts,
  on对话框Close,
}: 开始From提示词对话框Props) => {
  const router = useRouter();
  const [selected提示词Id, setSelected提示词Id] = useState<string | null>(null);
  const notification = useNotification();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const jawn = useJawnClient();

  const { prompts: promptVersions, isLoading: isLoadingVersions } =
    use提示词Versions(selected提示词Id ?? "");

  const handle提示词Select = (promptId: string) => {
    setSelected提示词Id(promptId);
    setSelectedVersionId(null);
  };

  const handleCreate实验 = async () => {
    if (!selected提示词Id || !selectedVersionId) {
      notification.setNotification(
        "Please select a prompt and version",
        "error",
      );
      return;
    }
    const promptVersion = promptVersions?.find(
      (p) => p.id === selectedVersionId,
    );
    const prompt = prompts?.find((p) => p.id === selected提示词Id);

    const experiment表格Result = await jawn.POST("/v2/experiment/new", {
      body: {
        name: `${prompt?.user_defined_id}_V${promptVersion?.major_version}.${promptVersion?.minor_version}`,
        original提示词Version: selectedVersionId,
      },
    });

    if (experiment表格Result.error || !experiment表格Result.data) {
      notification.setNotification("创建实验失败", "error");
      return;
    }

    router.push(
      `/experiments/${experiment表格Result.data?.data?.experimentId}`,
    );
  };

  return (
    <对话框Content className="w-[500px] rounded-md p-4 shadow-lg">
      <div>
        <div className="flex flex-row items-center space-x-2 text-center">
          <BeakerIcon className="h-4 w-4" />
          <h3 className="mb-2 text-lg font-medium">从提示词开始</h3>
        </div>

        <p className="mb-2 text-sm text-slate-500">
          Choose an existing prompt and select the version you want to
          experiment on.
        </p>
        <div className="rounded-md border border-slate-200 dark:border-slate-700">
          <ScrollArea className="flex max-h-[30vh] flex-col overflow-y-auto px-1 py-2 pt-0">
            {prompts &&
              prompts?.map((prompt) => (
按钮
                  key={prompt.id}
                  variant="ghost"
                  className={`mt-2 w-full justify-start ${
                    selected提示词Id === prompt.id
                      ? "bg-slate-200 dark:bg-slate-800"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handle提示词Select(prompt.id)}
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {prompt.user_defined_id}
                </按钮>
              ))}
          </ScrollArea>
          <div className="flex cursor-pointer flex-row items-center space-x-2 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
            <PlusIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            <对话框>
              <对话框Trigger asChild>
                <span className="text-md font-normal text-slate-700 dark:text-slate-300">
                  Create a new prompt
                </span>
              </对话框Trigger>
              <新建实验对话框 />
            </对话框>
          </div>
        </div>

        <div className="mt-4 flex flex-row items-center justify-center space-x-2">
          <h4 className="font-semibold">Version</h4>
          <Select
            value={selectedVersionId ?? ""}
            onValueChange={setSelectedVersionId}
          >
            <SelectTrigger>
              <SelectValue
                className="text-xl"
                placeholder={
                  isLoadingVersions
                    ? "Loading versions..."
                    : "Select the version"
                }
              />
            </SelectTrigger>
            <SelectContent className="text-xl">
              {!isLoadingVersions &&
                promptVersions
                  ?.filter((version) => version.minor_version === 0)
                  ?.map((version: any) => (
                    <SelectItem
                      key={version.id}
                      value={version.id}
                      className={`cursor-pointer ${
                        selectedVersionId === version.id
                          ? "bg-accent"
                          : "hover:bg-accent"
                      }`}
                    >
                      {version.name ||
                        `V ${version.major_version}.${version.minor_version}`}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-row items-center justify-center space-x-2">
按钮
            variant="outline"
            onClick={() => on对话框Close(false)}
            className="w-full"
          >
            Cancel
          </按钮>
按钮
            variant="default"
            disabled={!selectedVersionId}
            onClick={handleCreate实验}
            className="w-full"
          >
            Create experiment
          </按钮>
        </div>
      </div>
    </对话框Content>
  );
};
