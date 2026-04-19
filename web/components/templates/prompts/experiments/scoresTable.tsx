import 模型Pill from "../../requests/modelPill";
import { clsx } from "../../../shared/clsx";
import { Simple表格 } from "../../../shared/table/simple表格";

type 评分 = {
  valueType: string;
  value: number | string;
};

type 实验评分s = {
  dataset: {
    scores: Record<string, 评分>;
  };
  hypothesis: {
    scores: Record<string, 评分>;
  };
};

export type 评分sProps = {
  scores: 实验评分s;
};
const 评分s表格 = ({ scores }: 评分sProps) => {
  const calculateChange = (dataset评分: number, hypothesis评分: number) => {
    const change = hypothesis评分 - dataset评分;
    const percentageChange = (() => {
      if (dataset评分 === 0) {
        return hypothesis评分 !== 0 ? 100 : 0;
      }
      return (change / Math.abs(dataset评分)) * 100;
    })();

    return {
      change: parseFloat(change.toFixed(4)),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const get评分Value = (score: 评分, field: string) => {
    if (field === "dateCreated" && score.valueType === "string") {
      return render评分Value(score.value);
    }
    if (
      field === "cost" &&
      score.valueType === "number" &&
      typeof score.value === "number"
    ) {
      return `$${score.value.toFixed(4)}`;
    }
    if (
      field === "latency" &&
      score.valueType === "number" &&
      typeof score.value === "number"
    ) {
      return `${(+score.value / 1000).toFixed(2)}s`;
    }
    if (score.valueType === "boolean") {
      return score.value === 1 ? "True" : "False";
    }
    if (
      field === "model" &&
      score.valueType === "string" &&
      typeof score.value === "string"
    ) {
      return <模型Pill model={score.value} />;
    }
    return score.value;
  };

  const get评分Attribute = (key: string) => {
    switch (key) {
      case "cost":
        return "Cost";
      case "model":
        return "模型";
      case "dateCreated":
        return "创建日期";
      case "latency":
        return "Latency";
      default:
        return key;
    }
  };
  const renderComparisonCell = (
    field: string,
    scores: 实验评分s,
    changeInfo: any,
  ) => {
    switch (field) {
      case "dateCreated":
        return (
          <span
            className={clsx(
              scores.dataset.scores.dateCreated ===
                scores.hypothesis.scores.dateCreated
                ? "bg-gray-50 text-gray-700 ring-gray-200"
                : "bg-gray-50 text-gray-700 ring-gray-200",
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {formatDate(scores.dataset.scores.dateCreated.value as string) ===
            formatDate(scores.hypothesis.scores.dateCreated.value as string)
              ? "same"
              : "changed"}
          </span>
        );
      case "cost":
        const changeClass =
          changeInfo.change < 0
            ? "bg-green-50 text-green-700 ring-green-200"
            : changeInfo.change > 0
              ? "bg-red-50 text-red-700 ring-red-200"
              : "bg-gray-50 text-gray-700 ring-gray-200";
        return (
          <span
            className={clsx(
              changeClass,
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {`${changeInfo.change > 0 ? "+" : ""}${changeInfo.change} (${
              changeInfo.percentageChange
            }%)`}
          </span>
        );
      case "latency":
        const changeLatencyClass =
          changeInfo.change < 0
            ? "bg-green-50 text-green-700 ring-green-200"
            : changeInfo.change > 0
              ? "bg-red-50 text-red-700 ring-red-200"
              : "bg-gray-50 text-gray-700 ring-gray-200";
        return (
          <span
            className={clsx(
              changeLatencyClass,
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {`${changeInfo.change > 0 ? "+" : ""}${(
              changeInfo.change / 1000
            ).toFixed(2)} (${changeInfo.percentageChange}%)`}
          </span>
        );
      case "model":
        return (
          <span
            className={clsx(
              scores.dataset.scores.model === scores.hypothesis.scores.model
                ? "bg-gray-50 text-gray-700 ring-gray-200"
                : "bg-gray-50 text-gray-700 ring-gray-200",
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {scores.dataset.scores.model === scores.hypothesis.scores.model
              ? "same"
              : "changed"}
          </span>
        );
      default:
        return scores.dataset.scores[field].valueType === "boolean" ? (
          <span
            className={clsx(
              "bg-gray-50 text-gray-700 ring-gray-200",
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {scores.dataset.scores[field].value ===
            scores.hypothesis.scores[field].value
              ? "same"
              : "changed"}
          </span>
        ) : (
          <span
            className={clsx(
              "bg-gray-50 text-gray-700 ring-gray-200",
              "-my-1 w-max items-center rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
            )}
          >
            {`${changeInfo.change > 0 ? "+" : ""}${changeInfo.change} (${
              changeInfo.percentageChange
            }%)`}
          </span>
        );
    }
  };

  const render评分Value = (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString();
    }

    return value;
  };

  const get表格Data = (scores: 实验评分s) => {
    if (!scores || !scores.dataset.scores) {
      return [];
    }

    const experiment评分sAttributes = Object.keys(scores.dataset.scores);

    return experiment评分sAttributes.map((field) => {
      const dataset评分 = scores.dataset.scores[field];
      const hypothesis评分 = scores.hypothesis.scores[field];
      const comparisonCell =
        field !== "model" && field !== "dateCreated"
          ? hypothesis评分
            ? renderComparisonCell(
                field,
                scores,
                calculateChange(
                  dataset评分.value as number,
                  hypothesis评分.value as number,
                ),
              )
            : "N/A"
          : renderComparisonCell(field, scores, null);

      return {
        score_key: get评分Attribute(field),
        dataset: get评分Value(dataset评分, field),
        hypothesis: hypothesis评分
          ? get评分Value(hypothesis评分, field)
          : "N/A",
        compare: hypothesis评分 ? comparisonCell : "N/A",
      };
    });
  };
  return (
    <>
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Overview
        </h1>
      </div>
      <Simple表格
        data={get表格Data(scores) || []}
        columns={[
          {
            key: "score_key",
            header: "",
            render: (score) => (
              <div className="flex items-center font-semibold text-gray-500 dark:text-white">
                {score.score_key}
              </div>
            ),
          },
          {
            key: "dataset",
            header: "原始提示词",
            render: (score) => (
              <div className="text-black">{score.dataset}</div>
            ),
          },
          {
            key: "hypothesis",
            header: "实验 prompt",
            render: (score) => (
              <div className="text-black">{score.hypothesis}</div>
            ),
          },
          {
            key: "compare",
            header: "对比",
            render: (score) => (
              <div className="text-black">{score.compare}</div>
            ),
          },
        ]}
      />
    </>
  );
};

export default 评分s表格;
