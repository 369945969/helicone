import { Col } from "@/components/layout/common";
import { useInvalidate评估器s } from "@/components/templates/evals/评估器钩子";
import { use测试DataStore } from "@/components/templates/evals/testing/testingStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useJawnClient } from "@/lib/clients/jawn钩子";
import { useEffect } from "react";
import Markdown编辑or from "@/components/shared/markdown编辑or";
import useNotification from "../../../shared/notification/useNotification";
import { useEval面板Store } from "../store/eval面板Store";
import { CompositeOption, 测试Function } from "../testing/types";
import { useEval表单Store } from "../store/eval表单Store";
import { useEval配置Store } from "../store/eval配置Store";
import { logger } from "@/lib/telemetry/logger";
import { H3, Muted } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

const modelOptions = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];

export type 评估器配置表单Preset = {
  name: string;
  description: string;
  expectedValue类型: "boolean" | "choice" | "range";
  choice评分s?: Array<{ score: number; description: string }>;
  rangeMin?: number;
  rangeMax?: number;
  model: (typeof modelOptions)[number];
};

export const Python评估器配置表单: React.FC<{
  config表单Params: CompositeOption["preset"];
  name: string;
  existing评估器Id?: string;
  onSubmit: () => void;
  open测试面板?: (testFunction: 测试Function) => void;
}> = ({
  config表单Params,
  name: default名称,
  existing评估器Id,
  open测试面板,
  onSubmit,
}) => {
  const notification = useNotification();
  const jawn = useJawnClient();
  const invalidate评估器s = useInvalidate评估器s();
  const { set测试配置 } = use测试DataStore();
  const { isSubmitting, hide表单Buttons } = useEval表单Store();

  // Use the config store
  const {
    python名称,
    setPython名称,
    python描述,
    setPython描述,
    pythonCode,
    setPythonCode,
  } = useEval配置Store();

  // Initialize the store with default values if needed
  useEffect(() => {
    if (!python名称 && default名称) {
      setPython名称(default名称);
    }
    if (!python描述 && config表单Params.description) {
      setPython描述(config表单Params.description);
    }
    if (!pythonCode && config表单Params.code) {
      setPythonCode(config表单Params.code);
    }
  }, [
    default名称,
    config表单Params,
    python名称,
    setPython名称,
    python描述,
    setPython描述,
    pythonCode,
    setPythonCode,
  ]);

  const eval面板Store = useEval面板Store();

  useEffect(() => {
    set测试配置({
      _type: "python",
      evaluator_name: python名称,
      code: pythonCode,
    });
  }, [python名称, pythonCode, set测试配置]);

  const handleSubmit = async () => {
    // We don't need to set isSubmitting here as it's handled by the mutation hook
    try {
      if (existing评估器Id) {
        const result = await jawn.PUT("/v1/evaluator/{evaluatorId}", {
          params: {
            path: {
              evaluatorId: existing评估器Id,
            },
          },
          body: {
            name: python名称,
            description: python描述,
            code_template: { code: pythonCode },
            scoring_type: "PYTHON",
          },
        });
        if (!result.data?.data) {
          notification.setNotification("Failed to update evaluator", "error");
        } else {
          notification.setNotification(
            "评估器 updated successfully",
            "success",
          );
          invalidate评估器s.invalidate();
          onSubmit();
        }
      } else {
        const result = await jawn.POST("/v1/evaluator", {
          body: {
            name: python名称,
            description: python描述,
            code_template: {
              code: pythonCode,
            },
            scoring_type: "PYTHON",
          },
        });
        if (!result.data?.data) {
          notification.setNotification("Failed to create evaluator", "error");
        } else {
          notification.setNotification(
            "评估器 created successfully",
            "success",
          );
          invalidate评估器s.invalidate();
          onSubmit();
        }
      }
    } catch (error) {
      logger.error({ error }, "Error submitting Python evaluator");
      notification.setNotification("An error occurred", "error");
    }
  };

  const handle测试 = () => {
    const testFunction = async () => {
      const result = await jawn.POST("/v1/evaluator/python/test", {
        body: {
          code: pythonCode,
          testInput: config表单Params.testInput!,
        },
      });
      if (result?.data?.data) {
        return {
          ...(result?.data?.data ?? {}),
          _type: "completed" as const,
        };
      } else {
        return {
          _type: "error" as const,
          error: result?.data?.error ?? "Unknown error - try again",
        };
      }
    };

    if (open测试面板) {
      open测试面板(testFunction);
    } else {
      // Set test data first
      set测试配置({
        _type: "python",
        evaluator_name: python名称,
        code: pythonCode,
      });
      // Then open the test panel
      eval面板Store.open测试面板();
    }
  };

  return (
    <Col class名称="flex h-full flex-col overflow-hidden">
      <ScrollArea class名称="flex-grow overflow-y-auto">
        <div class名称="px-4 py-4">
          <Col class名称="space-y-6">
            <div>
              <div class名称="flex items-baseline gap-2">
                <H3 class名称="text-lg">基本信息</H3>
                <Muted class名称="text-sm">
                  Define your evaluator&apos;s name and purpose
                </Muted>
              </div>
              <Separator class名称="my-2" />
              <div class名称="mt-4 space-y-4">
                <div class名称="space-y-2">
                  <Label htmlFor="name">评估器名称</Label>
                  <Input
                    id="name"
                    value={python名称}
                    onChange={(e) => setPython名称(e.target.value)}
                    placeholder="输入评估器名称"
                    readOnly={!!existing评估器Id}
                    disabled={!!existing评估器Id}
                  />
                  {existing评估器Id && (
                    <div class名称="mt-1 text-xs text-muted-foreground">
                      评估器 names cannot be changed after creation
                    </div>
                  )}
                </div>
                <div class名称="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={python描述}
                    onChange={(e) => setPython描述(e.target.value)}
                    placeholder="描述评估器的功能"
                    class名称="min-h-[100px]"
                  />
                  <Muted class名称="text-xs">
                    描述s are used by the LLM to understand what the
                    evaluator does.
                  </Muted>
                </div>
              </div>
            </div>

            <div>
              <div class名称="flex items-baseline gap-2">
                <H3 class名称="text-lg">Python 代码</H3>
                <Muted class名称="text-sm">
                  Write your evaluator&apos;s Python code
                </Muted>
              </div>
              <Separator class名称="my-2" />

              <Markdown编辑or
                text={pythonCode}
                setText={setPythonCode}
                language={"python"}
                monaco={true}
                class名称="min-h-[300px] rounded-md border"
              />
            </div>
          </Col>
        </div>
      </ScrollArea>
    </Col>
  );
};
