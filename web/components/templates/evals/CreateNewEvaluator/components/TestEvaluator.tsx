import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { test评估器 } from "@/components/templates/evals/testing/test";
import { use测试DataStore } from "@/components/templates/evals/testing/testingStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, Tabs列表, TabsTrigger } from "@/components/ui/tabs";
import { useJawnClient } from "@/lib/clients/jawn钩子";
import { useQuery } from "@tanstack/react-query";
import Markdown编辑or from "../../../../shared/markdown编辑or";
import { 评估器测试Result } from "../types";
import { H4, Muted } from "@/components/ui/typography";
import { AlertCircle, CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function 测试评估器() {
  const { test配置, set测试配置, testInput, set测试Input } =
    use测试DataStore();

  const [promptTemplate, setPromptTemplate] = useState<string | undefined>(
    testInput?.promptTemplate ?? "",
  );
  const [result, setResult] = useState<评估器测试Result>(null);
  const [activeTab, setActiveTab] = useState("inputBody");
  const [loading, set加载中] = useState(false);

  const jawn = useJawnClient();

  const [requestId, setRequestId] = useState<string | undefined>(undefined);

  useQuery({
    queryKey: ["testInputs", requestId],
    queryFn: async () => {
      if (!requestId) {
        const requests = await jawn.POST("/v1/request/query-clickhouse", {
          body: {
            filter: {},
            limit: 1,
            sort: {
              created_at: "desc",
            },
          },
        });
        if (requests.data?.data && requests.data?.data.length > 0) {
          setRequestId(requests.data?.data[0].request_id);
        }
        return;
      }

      const request = await jawn.GET("/v1/request/{requestId}", {
        params: {
          path: {
            requestId: requestId,
          },
          query: {
            includeBody: true,
          },
        },
      });

      set测试Input({
        inputBody: JSON.stringify(
          request.data?.data?.request_body ?? {},
          undefined,
          4,
        ),
        inputs: {
          inputs: {},
          autoInputs: {},
        },
        outputBody: JSON.stringify(
          request.data?.data?.response_body ?? {},
          undefined,
          4,
        ),
        promptTemplate: "",
      });
    },
  });

  return (
    <div class名称="flex h-full flex-col">
      {/* Scrollable Input Area */}
      <ScrollArea class名称="flex-grow">
        <div class名称="space-y-4 p-4">
          {/* Request ID Input */}
          <div class名称="flex items-center gap-2">
            <Label class名称="whitespace-nowrap text-sm font-medium">
              Request ID
            </Label>
            <Input
              placeholder="输入请求 ID"
              class名称="flex-grow"
              value={requestId}
              onChange={(e) => {
                setRequestId(e.target.value);
              }}
            />
          </div>

          {/* 测试 Input 部分 */}
          <div class名称="space-y-2">
            <div class名称="flex items-center justify-between">
              <h3 class名称="text-sm font-medium">测试输入</h3>
            </div>

            <Tabs
              defaultValue="inputBody"
              value={activeTab}
              onValueChange={setActiveTab}
              class名称="w-full"
            >
              <Tabs列表 class名称="grid h-9 w-full grid-cols-4 bg-muted/30 p-0">
                <TabsTrigger value="inputBody" class名称="text-xs">
                  Input Body
                </TabsTrigger>
                <TabsTrigger value="outputBody" class名称="text-xs">
                  Output Body
                </TabsTrigger>
                <TabsTrigger value="inputs" class名称="text-xs">
                  Input Variables
                </TabsTrigger>
                {promptTemplate !== undefined && (
                  <TabsTrigger value="prompt" class名称="text-xs">
                    Prompt Template
                  </TabsTrigger>
                )}
              </Tabs列表>

              <TabsContent
                value="inputs"
                class名称="mt-2 space-y-2 rounded-md border bg-background p-3"
              >
                {Object.entries(testInput?.inputs?.inputs ?? []).length ===
                0 ? (
                  <div class名称="py-2 text-center">
                    <Muted>未定义输入变量</Muted>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        set测试Input((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            inputs: {
                              inputs: { ...prev.inputs.inputs, "": "" },
                              autoInputs: prev.inputs.autoInputs,
                            },
                          };
                        });
                      }}
                      class名称="mt-2"
                    >
                      + 添加 Input Variable
                    </Button>
                  </div>
                ) : (
                  <>
                    {Object.entries(testInput?.inputs?.inputs ?? []).map(
                      ([key, value], i) => (
                        <div
                          key={`input-${i}`}
                          class名称="flex items-center gap-2"
                        >
                          <Input
                            value={key}
                            onChange={(e) => {
                              const newKey = e.target.value;
                              set测试Input((prev) => {
                                if (!prev) return prev;

                                const newInputs = { ...prev.inputs.inputs };
                                delete newInputs[key];
                                newInputs[newKey] = value;
                                return {
                                  ...prev,
                                  inputs: {
                                    ...prev.inputs,
                                    inputs: newInputs,
                                    autoInputs: prev.inputs.autoInputs,
                                  },
                                };
                              });
                            }}
                            class名称="max-w-[200px]"
                            placeholder="变量名"
                          />
                          <span>:</span>
                          <Input
                            value={value}
                            onChange={(e) => {
                              set测试Input((prev) => {
                                if (!prev) return prev;
                                const newInputs = {
                                  ...prev.inputs.inputs,
                                  [key]: e.target.value,
                                };
                                return {
                                  ...prev,
                                  inputs: {
                                    ...prev.inputs,
                                    inputs: newInputs,
                                    autoInputs: prev.inputs.autoInputs,
                                  },
                                };
                              });
                            }}
                            class名称="flex-grow"
                            placeholder="值"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              set测试Input((prev) => {
                                if (!prev) return prev;
                                const newInputs = {
                                  ...prev.inputs.inputs,
                                };
                                delete newInputs[key];
                                return {
                                  ...prev,
                                  inputs: {
                                    inputs: newInputs,
                                    autoInputs: prev.inputs.autoInputs,
                                  },
                                };
                              });
                            }}
                          >
                            <XCircle class名称="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        set测试Input((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            inputs: {
                              inputs: { ...prev.inputs.inputs, "": "" },
                              autoInputs: prev.inputs.autoInputs,
                            },
                          };
                        });
                      }}
                      class名称="mt-1"
                    >
                      + 添加 Input Variable
                    </Button>
                  </>
                )}
              </TabsContent>

              {promptTemplate !== undefined && (
                <TabsContent
                  value="prompt"
                  class名称="mt-2 rounded-md border bg-background"
                >
                  <Markdown编辑or
                    class名称="min-h-[300px] border-0 text-sm"
                    text={promptTemplate}
                    setText={setPromptTemplate}
                    language="json"
                    monaco={false}
                  />
                </TabsContent>
              )}

              <TabsContent
                value="inputBody"
                class名称="mt-2 rounded-md border bg-background"
              >
                <Markdown编辑or
                  class名称="min-h-[300px] border-0 text-sm"
                  text={testInput?.inputBody ?? ""}
                  setText={(text) => {
                    set测试Input((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        inputBody: text,
                      };
                    });
                  }}
                  language="json"
                  monaco={false}
                />
              </TabsContent>

              <TabsContent
                value="outputBody"
                class名称="mt-2 rounded-md border bg-background"
              >
                <Markdown编辑or
                  class名称="min-h-[300px] border-0 text-sm"
                  text={testInput?.outputBody ?? ""}
                  setText={(text) => {
                    set测试Input((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        outputBody: text,
                      };
                    });
                  }}
                  language="json"
                  monaco={false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Results 部分 */}
      <div class名称="shrink-0 border-t bg-muted/10">
        <div class名称="space-y-3 p-4">
          <div class名称="flex items-center justify-between">
            <h3 class名称="text-sm font-medium">测试结果</h3>
            <Button
              onClick={async () => {
                if (!test配置) return;
                set加载中(true);
                setResult({ _type: "running" });
                try {
                  const res = await test评估器(test配置, jawn, testInput);
                  setResult(res);
                } catch (e) {
                  const errorMessage =
                    e instanceof Error
                      ? e.message
                      : typeof e === "object"
                        ? JSON.stringify(e, null, 2)
                        : String(e || "Unknown error");

                  setResult({
                    _type: "error",
                    error: errorMessage,
                  });
                } finally {
                  set加载中(false);
                }
              }}
              disabled={loading}
              size="sm"
              class名称="gap-2"
            >
              <PlayCircle class名称="h-4 w-4" />
              {loading ? "Running..." : "Run 测试"}
            </Button>
          </div>

          <div class名称="max-h-[180px] overflow-y-auto rounded-md border bg-background p-3">
            {result === null ? (
              <div class名称="py-4 text-center">
                <Muted>运行测试以查看结果</Muted>
              </div>
            ) : result._type === "running" ? (
              <div class名称="py-4 text-center">
                <Muted>Running test...</Muted>
              </div>
            ) : result._type === "error" ? (
              <div class名称="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <AlertCircle class名称="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <H4 class名称="text-sm text-destructive">错误</H4>
                  <pre class名称="mt-1 whitespace-pre-wrap text-xs">
                    {typeof result.error === "object"
                      ? JSON.stringify(result.error, null, 2)
                      : result.error}
                  </pre>
                </div>
              </div>
            ) : (
              <div class名称="space-y-3">
                <div class名称="flex items-center gap-2 rounded-md bg-muted p-3">
                  <CheckCircle2 class名称="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <H4 class名称="text-sm">分数</H4>
                    <div class名称="text-lg font-semibold">{result.output}</div>
                  </div>
                </div>

                {result.traces && result.traces.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger class名称="flex w-full items-center justify-between rounded-md border p-2 text-sm">
                      <span>查看执行跟踪</span>
                      <ChevronDown class名称="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent class名称="mt-2 space-y-2">
                      {result.traces.map((trace, i) => (
                        <div key={i} class名称="rounded-md border p-2">
                          <pre class名称="whitespace-pre-wrap text-xs">
                            {trace}
                          </pre>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
