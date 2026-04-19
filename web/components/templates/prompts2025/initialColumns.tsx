import { GitBranch, Clock, TestTube2 } from "lucide-react";
import { formatTime } from "./timeUtils";
import ModelPill from "@/components/templates/requests/modelPill";
import { ColumnConfig } from "@/components/shared/table/simpleTable";
import { PromptWithVersions } from "@/services/hooks/prompts";
import TagsSummary from "./TagsSummary";
import { Button } from "@/components/ui/button";
import PromptVersionPill from "./PromptVersionPill";

export const getInitialColumns = (
  onPlaygroundActionClick: (promptVersionId: string) => void,
): ColumnConfig<PromptWithVersions>[] => {
  return [
    {
      key: "prompt_id" as keyof PromptWithVersions,
      header: "提示词 ID",
      sortable: false,
      minSize: 150,
      render: (item) => {
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-black ring-1 ring-inset ring-gray-200">
            {item.prompt.id}
          </span>
        );
      },
    },
    {
      key: "name" as keyof PromptWithVersions,
      header: "名称",
      sortable: true,
      minSize: 250,
      render: (item) => {
        return (
          <span className="text-sm font-medium text-foreground">
            {item.prompt.name}
          </span>
        );
      },
    },
    {
      key: "version" as keyof PromptWithVersions,
      header: "版本",
      sortable: true,
      minSize: 100,
      render: (item) => (
        <PromptVersionPill
          majorVersion={item.productionVersion.major_version}
          minorVersion={item.productionVersion.minor_version}
        />
      ),
    },
    {
      key: "totalVersions" as keyof PromptWithVersions,
      header: "总版本数",
      sortable: true,
      minSize: 120,
      render: (item) => (
        <div className="flex items-center gap-1">
          <GitBranch size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{item.totalVersions}</span>
        </div>
      ),
    },
    {
      key: undefined,
      header: "模型",
      sortable: false,
      minSize: 250,
      render: (item) => <ModelPill model={item.productionVersion.model} />,
    },
    {
      key: undefined,
      header: "标签",
      sortable: false,
      minSize: 200,
      render: (item) => <TagsSummary tags={item.prompt.tags} />,
    },
    // TODO: ADD USAGE GRAPH
    // {
    //   key: undefined,
    //   header: "Usage",
    //   sortable: false,
    //   minSize: 200,
    //   render: (item) => {
    //     return (
    //       <div>
    //         <span></span>
    //       </div>
    //     )
    //   }
    // },
    {
      key: "playground" as keyof PromptWithVersions,
      header: "游乐场",
      sortable: false,
      minSize: 100,
      render: (item) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlaygroundActionClick(item.productionVersion.id);
            }}
            className="flex items-center gap-1 rounded-lg"
          >
            <TestTube2 size={14} className="text-muted-foreground" />
            <span className="ml-1">编辑</span>
          </Button>
        );
      },
    },
    {
      key: "created" as keyof PromptWithVersions,
      header: "创建时间",
      sortable: true,
      minSize: 300,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatTime(new Date(item.prompt.created_at), "")}
          </span>
        </div>
      ),
    },
  ];
};
