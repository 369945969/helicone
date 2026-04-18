import StyledAreaChart from "../styledAreaChart";
import { sortAndColorDataByName } from "./utils";
import { useExpandableBarList } from "./barListPanel";

interface ModelsPanelProps {
  models: {
    data:
      | {
          model: string;
          total_requests: number;
        }[]
      | undefined;
    isLoading: boolean;
  };
}

const ModelsPanel = (props: ModelsPanelProps) => {
  const { models } = props;

  const modelData = sortAndColorDataByName(
    models?.data?.map((model) => ({
      name: model.model,
      value: model.total_requests,
    })),
  );

  const maxValue = modelData[0]?.value || 1;

  const { expandButton, barList, modal } = useExpandableBarList({
    data: modelData,
    maxValue,
    formatValue: (value) => value.toLocaleString(),
    modalTitle: "顶级模型",
    modalValueLabel: "请求",
  });

  return (
    <>
      <StyledAreaChart
        title={`顶级模型`}
        value={undefined}
        isDataOverTimeLoading={models.isLoading}
        withAnimation={true}
        headerAction={expandButton}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs font-semibold text-foreground">名称</p>
            <p className="text-xs font-semibold text-foreground">请求</p>
          </div>
          <div className="flex-grow overflow-y-auto">{barList}</div>
        </div>
      </StyledAreaChart>
      {modal}
    </>
  );
};

export default ModelsPanel;
