import React from "react";
import { 行 } from "../../layout/common";
import Markdown编辑or from "../../shared/markdown编辑or";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 卡片, 卡片标题, 卡片Content } from "@/components/ui/card";
import { useGetHelicone数据集行s } from "@/services/hooks/dataset/helicone数据集";

type 数据集行 =
  | Return类型<typeof useGetHelicone数据集行s>["rows"][number]
  | null;

interface 编辑数据集Props {
  selected行: 数据集行;
  is编辑ing: boolean;
  requestBody: string;
  responseBody: string;
  on请求BodyChange: (text: string) => void;
  onResponseBodyChange: (text: string) => void;
}

const 编辑数据集: React.FC<编辑数据集Props> = ({
  selected行,
  is编辑ing,
  requestBody,
  responseBody,
  on请求BodyChange,
  onResponseBodyChange,
}) => {
  return (
    <div class名称="flex flex-col space-y-4">
      <行 class名称="items-center justify-start space-x-2">
        <h2 class名称="text-2xl font-semibold">{selected行?.id}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ArrowUpRightIcon
                class名称="h-5 w-5 cursor-pointer text-gray-500"
                onClick={() => {
                  window.open(
                    `/requests?requestId=${selected行?.origin_request_id}`,
                    "_blank",
                  );
                }}
              />
            </TooltipTrigger>
            <TooltipContent>查看原始请求</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </行>
      <div class名称="flex flex-col space-y-4">
        <行 class名称="gap-5">
          <卡片 class名称="w-1/2">
            <卡片标题 class名称="bg-muted">
              <h3 class名称="text-md font-medium">请求主体</h3>
            </卡片标题>
            <卡片Content class名称="p-0">
              <Markdown编辑or
                text={requestBody}
                language="json"
                class名称="border-none"
                setText={(text) => {
                  if (is编辑ing) on请求BodyChange(text);
                }}
              />
            </卡片Content>
          </卡片>
          <卡片 class名称="w-1/2">
            <卡片标题 class名称="bg-muted">
              <h3 class名称="text-md font-medium">响应主体</h3>
            </卡片标题>
            <卡片Content class名称="p-0">
              <Markdown编辑or
                text={responseBody}
                language="json"
                class名称="border-none"
                setText={(text) => {
                  if (is编辑ing) onResponseBodyChange(text);
                }}
              />
            </卡片Content>
          </卡片>
        </行>
      </div>
    </div>
  );
};

export default 编辑数据集;
