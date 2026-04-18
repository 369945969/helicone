import { Badge } from "@/components/ui/badge";

// Import shadcn components

// Import Recharts components
import { ColumnDef } from "@tanstack/react-table";
import { AverageScoreChart } from "./charts/AverageScoreChart";
import { ScoreDistributionChart } from "./charts/ScoreDistributionChart";
import { ScoreDistributionChartPie } from "./charts/ScoreDistributionChartPie";
import { 追踪Chart } from "./charts/追踪Chart";

export type EvalMetric = {
  name: string;
  type: string;
  value类型: string;
  averageScore: number;
  minScore: number;
  maxScore: number;
  count: number;
  overTime: { date: string; count: number }[];
  scoreDistribution: { lower: number; upper: number; value: number }[];
  averageOverTime: { date: string; value: number }[];
  id?: string;
};

export const INITIAL_COLUMNS: ColumnDef<EvalMetric>[] = [
  {
    accessorKey: "name",
    header: "名称",
    cell: (info) => (
      <span class名称="font-medium text-gray-900 dark:text-gray-100">
        {info.get值()
          ? `${info.get值()}`.replaceAll("-hcone-bool", " ")
          : "无评估器名称"}
      </span>
    ),
    minSize: 50,
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: (info) => (
      <Badge variant={"outline"}>{info.get值() as string}</Badge>
    ),
    minSize: 50,
  },
  {
    accessorKey: "value类型",
    header: "值",
    cell: (info) => (
      <Badge variant={"outline"}>{info.get值() as string}</Badge>
    ),
    minSize: 100,
    size: 100,
  },
  {
    accessorKey: "overTime",
    header: "追踪",
    cell: (info) => (
      <追踪Chart
        overTime={info.get值() as { date: string; count: number }[]}
      />
    ),
    minSize: 200,
  },
  {
    accessorKey: "averageOverTime",
    header: "平均评分",
    cell: (info) => (
      <AverageScoreChart
        averageOverTime={info.get值() as { date: string; value: number }[]}
      />
    ),
    minSize: 200,
  },
  {
    accessorKey: "scoreDistribution",
    header: "评分分布",
    cell: (info) =>
      info.row.original.value类型 !== "布尔值" ? (
        <ScoreDistributionChart
          distribution={
            info.get值() as { lower: number; upper: number; value: number }[]
          }
        />
      ) : (
        <ScoreDistributionChartPie
          distribution={
            info.get值() as { lower: number; upper: number; value: number }[]
          }
        />
      ),
    minSize: 100,
  },
  {
    accessorKey: "count",
    header: "计数",
    cell: (info) => <span>{Number(info.get值()).toLocaleString()}</span>,
    meta: {
      sortKey: "count",
    },
  },
  {
    accessorKey: "averageScore",
    header: "平均评分",
    cell: (info) => <span>{Number(info.get值()).toFixed(2)}</span>,
    meta: {
      sortKey: "averageScore",
    },
  },

  {
    accessorKey: "minScore",
    header: "最低评分",
    cell: (info) => Number(info.get值()).toLocaleString(),
    meta: {
      sortKey: "minScore",
    },
  },
  {
    accessorKey: "maxScore",
    header: "最高评分",
    cell: (info) => Number(info.get值()).toLocaleString(),
    meta: {
      sortKey: "maxScore",
    },
    minSize: 200,
  },
];
