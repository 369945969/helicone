import {
  Chart容器,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useExperiment评分s } from "@/services/hooks/prompts/experiment-scores";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useExperimentTable } from "../hooks/useExperimentTable";
import { 提示词Version } from "./提示词Version";

const 评分s图表 = ({
提示词版本
  experimentId,
  scores,
}: {
  promptVersions: 提示词Version[];
  experimentId: string;
  scores: Record<
    string,
    {
      data: Record<
        string,
        {
          value: any;
          valueType: string;
        }
      >;
      error: string | null;
    }
  >;
}) => {
  const { outputColumns, scores: scoreCriterias } = promptVersions.reduce(
    (acc, promptVersion) => {
      const promptVersion评分s = scores[promptVersion?.id]?.data;
      if (promptVersion评分s) {
        acc.scores = Array.from(
          new Set([...acc.scores, ...Object.keys(promptVersion评分s)]),
        ).filter((key) => !key.includes("dateCreated")); // Exclude dateCreated from scores
      }
      return acc;
    },
    {
      outputColumns: promptVersions,
      scores: [] as string[],
    },
  );

  const { get评分ColorMapping } = useExperiment评分s(experimentId);

  const chart配置 = useMemo(() => {
    return get评分ColorMapping(scoreCriterias);
  }, [get评分ColorMapping, scoreCriterias]);

  const chartData = useMemo(() => {
    return promptVersions.map((promptVersion) => {
      const getMinMaxValues = (scoreKey: string) => {
        const values = promptVersions
          .map((pv) => scores[pv.id]?.data[scoreKey]?.value)
          .filter((v) => v !== undefined && v !== null);
        return {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      };

      return {
        promptVersionLabel:
          promptVersion.metadata.label ??
          `v${promptVersion.major_version}.${promptVersion.minor_version}`,
        ...Object.fromEntries(
          scoreCriterias.flatMap((score) => {
            const promptVersion评分s = scores[promptVersion.id]?.data;
            const value = promptVersion评分s?.[score]?.value;
            const valueType = promptVersion评分s?.[score]?.valueType;

            if (!promptVersion评分s || scores[promptVersion.id]?.error) {
              return [
                [score, 0],
                [`${score}_original`, 0],
              ];
            }

            let normalizedValue;
            if (valueType === "boolean" || score.endsWith("-hcone-bool")) {
              normalizedValue = value ? 100 : 0;
            } else if (valueType === "number") {
              const { min, max } = getMinMaxValues(score);
              if (min === max) {
                normalizedValue = value === min ? 100 : 0;
              } else {
                normalizedValue = ((value - min) / (max - min)) * 100;
              }
            } else if (valueType === "string") {
              normalizedValue = 0;
            }

            return [
              [score, normalizedValue],
              [`${score}_original`, value],
            ];
          }),
        ),
      };
    });
  }, [promptVersions, scoreCriterias, scores]);

  const queryClient = useQueryClient();

  const { selected评分Key } = useExperimentTable(experimentId);

  return (
    <div className={cn("h-[300px] w-full overflow-auto px-8")}>
      <Chart容器 config={chart配置} className="h-full w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 20,
          }}
          onClick={() => {
            queryClient.setQueryData(["selected评分Key", experimentId], null);
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            vertical={false}
          />
          <XAxis
            padding={{ left: 12, right: 24 }}
            dataKey="promptVersionLabel"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartLegend
            layout="horizontal"
            verticalAlign="top"
            align="left"
            height={36}
            // iconType="square"
            // iconSize={10}
            content={
              <ChartLegendContent
                selected评分Key={selected评分Key ?? ""}
                key=""
              />
            }
          />
          <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
          {scoreCriterias.map((score) => (
            <Line
              style={{ cursor: "pointer" }}
              key={score}
              dataKey={score}
              type="linear"
              stroke={
                selected评分Key
                  ? selected评分Key === score
                    ? chart配置[score].color
                    : "gray"
                  : chart配置[score].color
              }
              strokeOpacity={
                selected评分Key ? (selected评分Key === score ? 1 : 0.5) : 1
              }
              strokeWidth={2}
              dot={{
                fill: selected评分Key
                  ? selected评分Key === score
                    ? chart配置[score].color
                    : "gray"
                  : chart配置[score].color,
                opacity: 1,
              }}
              onClick={(_e, event) => {
                event.stopPropagation();
                queryClient.setQueryData(
                  ["selected评分Key", experimentId],
                  score,
                );
              }}
              name={score.replace("-hcone-bool", "")}
            />
          ))}
        </LineChart>
      </Chart容器>
    </div>
  );
};

export default 评分s图表;
