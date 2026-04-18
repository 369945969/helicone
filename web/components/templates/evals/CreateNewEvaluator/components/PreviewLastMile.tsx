import { Col } from "@/components/layout/common";
import { DataEntry, LastMileConfigForm, TestInput } from "../types";

export function RenderDataEntry(dataEntry: DataEntry) {
  return <div>{dataEntry._type}</div>;
}

export function PreviewLastMile({
  testDataConfig,
  testInput,
}: {
  testDataConfig: LastMileConfigForm;
  testInput: TestInput;
}) {
  // const NormalizedRequest = useMemo(() => {
  //   return getNormalizedRequest({

  //   });
  // }, [testInput.inputBody]);
  return (
    <div>
      <Col>
        {/* <Label>Input</Label>

        {JSON.stringify(testDataConfig.input)}
        <Label>Output</Label>
        {JSON.stringify(testDataConfig.output)}
        <Label>提示词模板</Label>
        <Label>真实值</Label>
        {"groundTruth" in testDataConfig && (
          <div>
            <Label>真实值</Label>
            {JSON.stringify(testDataConfig.groundTruth)}
          </div>
        )} */}
      </Col>
    </div>
  );
}
