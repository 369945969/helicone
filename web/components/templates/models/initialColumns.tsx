import { ColumnDef } from "@tanstack/react-table";
import { ModelMetric } from "../../../services/hooks/models";
import ModelPill from "../requests/modelPill";

export const INITIAL_COLUMNS: ColumnDef<ModelMetric>[] = [
  {
    accessorKey: "model",
    header: "模型",
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {info.getValue() === "" ? (
          "n/a"
        ) : (
          <ModelPill model={info.getValue() as string} />
        )}
      </span>
    ),
    minSize: 300,
  },
  {
    accessorKey: "total_requests",
    header: "请求数",
    cell: (info) => info.getValue(),
    minSize: 200,
  },
  {
    accessorKey: "total_prompt_token",
    header: "提示词令牌数",
    cell: (info) => info.getValue(),
    minSize: 200,
  },
  {
    accessorKey: "total_completion_tokens",
    header: "补全令牌数",
    cell: (info) => info.getValue(),
    minSize: 200,
  },
  {
    accessorKey: "total_tokens",
    header: "总令牌数",
    cell: (info) => info.getValue(),
    minSize: 200,
  },
  {
    accessorKey: "cost",
    header: "成本",
    cell: (info) => <span>{`$${info.getValue()}`}</span>,
  },
];
