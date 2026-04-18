import { useMemo, useState } from "react";
import ThemedDrawer from "../../../shared/themed/themedDrawer";
import { useJawnClient } from "../../../../lib/clients/jawnHook";
import useNotification from "../../../shared/notification/useNotification";
import 提示词PropertyCard from "../id/promptPropertyCard";
import { Button } from "@/components/ui/button";
import { 输入 } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface 实验输入选择器Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  prompt版本Id: string | undefined;
  onSuccess?: (success: boolean) => void;
  handleAddRows: (
    rows: {
      inputRecordId: string;
      inputs: Record<string, string>;
      auto输入s: any[];
    }[],
  ) => void;
}

export const 实验随机输入选择器 = (
  props: 实验输入选择器Props,
) => {
  const { open, setOpen, prompt版本Id, onSuccess } = props;
  const jawn = useJawnClient();
  const { setNotification } = useNotification();

  const [number输入, setNumber输入] = useState(10); // Default to 10 inputs

  // Fetch random input records using useQuery
  const {
    data: random输入RecordsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["random输入Records", prompt版本Id],
    queryFn: async () => {
      const res = await jawn.POST(
        "/v1/prompt/version/{prompt版本Id}/inputs/query",
        {
          params: {
            path: {
              prompt版本Id: prompt版本Id ?? "",
            },
          },
          body: {
            limit: 100,
            random: true,
          },
        },
      );
      return res.data?.data ?? [];
    },
    enabled: open && prompt版本Id !== undefined, // Fetch only when the drawer is open
  });

  // Process and select the desired number of random inputs
  const selected随机输入s = useMemo(() => {
    if (!random输入RecordsData) return [];

    // Shuffle the records
    const shuffled = [...random输入RecordsData].sort(
      () => Math.random() - 0.5,
    );

    // Select the number of inputs specified by number输入
    return shuffled.slice(0, number输入).map((row) => ({
      id: row.id,
      inputs: row.inputs,
      source_request: row.source_request,
      prompt_version: row.prompt_version,
      created_at: row.created_at,
      response: row.response_body,
      auto输入s: row.auto_prompt_inputs,
    }));
  }, [random输入RecordsData, number输入]);

  return (
    <ThemedDrawer open={open} setOpen={setOpen}>
      <div className="flex h-full w-full flex-col justify-between space-y-4">
        <div className="flex w-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              随机ized 输入s ({selected随机输入s.length})
            </h2>
          </div>
          <p className="pb-4 text-sm text-gray-500">
            Select the inputs you want to include in the dataset.
          </p>

          <div className="mb-4 flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumber输入((prev) => Math.max(prev - 1, 1))}
              className="mr-2 border p-2"
            >
              -
            </Button>
            <输入
              type="number"
              value={number输入}
              onChange={(e) => {
                const value = e.target.value.replace(/^0+/, ""); // Remove leading zeros
                setNumber输入(Number(value) || 1);
              }}
              className="mr-2 h-full w-10 border p-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumber输入((prev) => prev + 1)}
              className="mr-2 border p-2"
            >
              +
            </Button>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              随机 输入s
            </span>
          </div>

          <ul className="flex w-full flex-col items-center space-y-4 overflow-y-auto pt-4">
            {isLoading && <div>正在加载输入...</div>}
            {isError && <div>加载输入时出错。</div>}
            {!isLoading &&
              !isError &&
              selected随机输入s.map((request) => (
                <li key={request.id} className="flex w-full items-start">
                  <提示词PropertyCard
                    auto输入s={request.auto输入s}
                    isSelected={true}
                    requestId={request.source_request}
                    createdAt={request.created_at}
                    properties={request.inputs}
                  />
                </li>
              ))}
          </ul>
        </div>

        <div className="sticky bottom-0 flex justify-end space-x-4 bg-white py-4 pb-20 dark:bg-black">
          <Button
            variant={"secondary"}
            size={"sm"}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant={"default"}
            size={"sm"}
            onClick={async () => {
              await props.handleAddRows(
                selected随机输入s.map((request) => ({
                  inputRecordId: request.id,
                  inputs: request.inputs,
                  auto输入s: request.auto输入s,
                })),
              );

              if (onSuccess) {
                onSuccess(true);

                setNotification("已将输入添加到数据集", "success");
                setOpen(false);
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </ThemedDrawer>
  );
};
