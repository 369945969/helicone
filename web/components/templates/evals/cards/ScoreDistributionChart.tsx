import React from "react";
import { 评估器Stats } from "../hooks/use评估器Stats";
import {
  ResponsiveContainer,
  Bar图表,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { Small } from "@/components/ui/typography";

interface 评分分布图表Props {
  distributionData: 评估器Stats["score分布"];
  className?: string;
}

/**
 * 分布 chart to visualize score distribution using Recharts
 */
export const 评分分布图表: React.FC<评分分布图表Props> = ({
  distributionData,
  className = "",
}) => {
  // Check if we have real data
  const hasData = distributionData && distributionData.length > 0;

  // If no data, show a message instead of chart
  if (!hasData) {
    return (
      <div className={`flex h-24 items-center justify-center ${className}`}>
        <Small className="text-muted-foreground">无可用数据</Small>
      </div>
    );
  }

  // Process real data for charting
  const processedData = distributionData.map((item) => ({
    range: item.range,
    count: Number(item.count) || 0, // Ensure count is a number
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="text-xs font-medium">{`评分 range: ${payload[0].payload.range}`}</p>
          <p className="text-xs text-muted-foreground">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`h-24 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <Bar图表
          data={processedData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          />
          <Bar
            dataKey="count"
            fill="#0EA5E9" // sky-500 in Tailwind
            radius={[2, 2, 0, 0]}
          />
        </Bar图表>
      </ResponsiveContainer>
    </div>
  );
};
