import { Button } from "@/components/ui/button";
import {
  弹出框,
  弹出框Content,
  弹出框Trigger,
} from "@/components/ui/popover";
import {
  表格,
  表格Body,
  表格Cell,
  表格Head,
  表格标题,
  表格Row,
} from "@/components/ui/table";
import {
  ResizableHandle,
  Resizable面板,
  Resizable面板Group,
} from "@/components/ui/resizable";
import { Island容器 } from "@/components/ui/island容器";
import HcBreadcrumb from "@/components/ui/hcBreadcrumb";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import {
  create列Helper,
  flexRender,
  getCoreRowModel,
  useReact表格,
} from "@tanstack/react-table";
import clsx from "clsx";
import { ListIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import 实验输入选择器 from "../experiment输入选择器";
import { 实验Random输入选择器 } from "../experimentRandom输入选择器";
import Add列对话框 from "./Add列对话框";
import Add列标题 from "./Add列标题";
import AddManualRow面板 from "./AddManualRow面板";
import { 假设Cell渲染器 } from "./cells/假设Cell渲染器";
import { AddRow弹出框 } from "./components/addRow弹出框";
import {
  实验表格标题,
  Index列Cell,
  输入Cell,
  输入s标题Component,
  Prompt列标题,
} from "./components/tableElements渲染器";
import Edit输入s面板 from "./Edit输入s面板";
import { use实验表格 } from "./hooks/use实验表格";
import 评分评估器配置 from "./scores/评分评估器配置";
import 评分图表容器 from "./scores/评分图表容器";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import 实验数据集选择器 from "../experiment数据集选择器";
import ImportCSV对话框 from "./ImportCSV对话框";
import { useFeatureLimit } from "@/hooks/useFreeTierLimit";
import { FreeTierLimitBanner } from "@/components/shared/FreeTierLimitBanner";

type 表格DataType = {
  index: number;
  inputs: Record<string, string>;
  auto输入s: any[];
  rowRecordId: string;
  add_prompt: string;
  original输入RecordId: string;
  [key: `prompt_version_${string}`]: {
    request_id: string;
    input_record_id: string;
  };
};

export function 实验表格({
  experiment表格Id,
}: {
  experiment表格Id: string;
}) {
  const {
    experiment表格Query,
    prompt版本TemplateData,
    prompt版本sData,
    add实验表格RowInsertBatch,
    add实验表格RowInsertFrom数据集Batch,
    inputKeysData,
    wrapText,
    deleteSelectedRows,
    deletePrompt版本,
  } = use实验表格(experiment表格Id);

  // Variant limit check
  const variantCount = prompt版本sData?.length || 0;
  const {
    canCreate: canCreateVariant,
    hasAccess: hasAccess,
    freeLimit: MAX_VARIANTS,
  } = useFeatureLimit("experiments", variantCount, "variants");

  const [popoverOpen, set弹出框Open] = useState(false);
  const [show实验输入选择器, setShow实验输入选择器] =
    useState(false);
  const [showRandom输入选择器, setShowRandom输入选择器] = useState(false);
  const [show实验数据集选择器, setShow实验数据集选择器] =
    useState(false);
  const [right面板, setRight面板] = useState<
    "edit_inputs" | "add_manual" | null
  >(null);
  const [toEdit输入Record, setToEdit输入Record] = useState<{
    id: string;
    inputKV: Record<string, string>;
    auto输入s: Record<string, any>;
  } | null>(null);
  const [show评分, setShow评分] = useState(false);
  const [showDeleteRowsConfirmation, setShowDeleteRowsConfirmation] =
    useState(false);

  const cellRefs = useRef<Record<string, any>>({});
  const [
    externallySelectedForkFromPrompt版本Id,
    setExternallySelectedForkFromPrompt版本Id,
  ] = useState<string | null>(null);
  const [isAdd列对话框Open, setIsAdd列对话框Open] = useState(false);
  const [showImportCsvModal, setShowImportCsvModal] = useState(false);

  const [rowSelection, setRowSelection] = useState({});

  const columnHelper = create列Helper<表格DataType>();

  const columnDef: ReturnType<typeof columnHelper.group>[] = useMemo(
    () => [
      columnHelper.group({
        id: "index__outer",
        header: () =>
          table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
            <div className="group relative flex items-center justify-center text-slate-400 dark:text-slate-600">
              <input
                type="checkbox"
                className="peer relative h-4 w-4 shrink-0 cursor-pointer appearance-none self-center rounded-sm border-slate-200 bg-slate-200 text-white checked:border-0 checked:bg-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-900 dark:checked:bg-slate-300"
                checked={!!table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
              <svg
                className="pointer-events-none absolute hidden h-4 w-4 text-white peer-checked:block dark:text-slate-900"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          ) : (
            <div className="group relative flex items-center justify-center text-slate-400 dark:text-slate-600">
              <span className="transition-opacity duration-200 group-hover:invisible">
                <ListIcon className="h-4 w-4" />
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="invisible absolute ml-2 h-[22px] w-[24px] items-center justify-center rounded-md border p-0 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100"
                  >
                    <PlayIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onSelect={async () => {
                      await Promise.all(
                        (prompt版本sData ?? []).map(async (pv) => {
                          const rows = table.getRowModel().rows;
                          await Promise.all(
                            rows.map(async (row) => {
                              const cellRef =
                                cellRefs.current[`${row.id}-${pv.id}`];
                              if (cellRef) {
                                await cellRef.run假设();
                              }
                            }),
                          );
                        }),
                      );
                    }}
                  >
                    Run all cells
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={async () => {
                      await Promise.all(
                        (prompt版本sData ?? []).map(async (pv) => {
                          const rows = table.getRowModel().rows;
                          await Promise.all(
                            rows.map(async (row) => {
                              const cellRef =
                                cellRefs.current[`${row.id}-${pv.id}`];
                              if (cellRef) {
                                await cellRef.run假设IfRequired();
                              }
                            }),
                          );
                        }),
                      );
                    }}
                  >
                    Run unexecuted cells
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        columns: [
          columnHelper.accessor("index", {
            header: () => <></>,
            cell: ({ row }) => (
              <Index列Cell
                areSomeSelected={table.getIsSomeRowsSelected()}
                isSelected={row.getIsSelected()}
                onSelectChange={row.getToggleSelectedHandler()}
                index={row.original.index}
                onRunRow={async () => {
                  await Promise.all(
                    (prompt版本sData ?? []).map((pv) => {
                      const cellRef = cellRefs.current[`${row.id}-${pv.id}`];
                      if (cellRef) {
                        cellRef.run假设();
                      }
                    }),
                  );
                }}
              />
            ),
            size: 80,
            enableResizing: false,
          }),
        ],
      }),
      columnHelper.group({
        id: "inputs__outer",
        header: () => (
          <Prompt列标题 label="输入" prompt版本Id="inputs" />
        ),
        columns: [
          columnHelper.accessor("inputs", {
            header: () => (
              <输入s标题Component inputs={inputKeysData ?? []} />
            ),
            cell: ({ row }) => (
              <输入Cell
                experiment输入s={inputKeysData ?? []}
                row输入s={row.original.inputs}
                rowRecordId={row.original.rowRecordId}
                experimentAuto输入s={row.original.auto输入s}
                onClick={() => {
                  setToEdit输入Record({
                    id: row.original.original输入RecordId ?? "",
                    inputKV: row.original.inputs,
                    auto输入s: row.original.auto输入s,
                  });
                  setRight面板("edit_inputs");
                }}
              />
            ),
            size: 250,
            enableResizing: true,
          }),
        ],
      }),
      ...(prompt版本sData ?? []).map((pv) =>
        columnHelper.group({
          id: `prompt_version_${pv.id}__outer`,
          header: () => (
            <Prompt列标题
              prompt版本Id={pv.id}
              label={
                pv.metadata?.label
                  ? `${pv.metadata?.label}`
                  : `v${pv.major_version}.${pv.minor_version}`
              }
              onDelete列={
                pv.id !== experiment表格Query?.copied_original_prompt_version
                  ? () => {
                      deletePrompt版本.mutate({
                        prompt版本Id: pv.id,
                      });
                    }
                  : undefined
              }
              onFork列={() => {
                setExternallySelectedForkFromPrompt版本Id(pv.id);
                setIsAdd列对话框Open(true);
              }}
              onRun列={async () => {
                const rows = table.getRowModel().rows;

                await Promise.all(
                  rows.map(async (row) => {
                    const cellRef = cellRefs.current[`${row.id}-${pv.id}`];
                    if (cellRef) {
                      await cellRef.run假设();
                    }
                  }),
                );
              }}
            />
          ),
          columns: [
            columnHelper.accessor(`prompt_version_${pv.id}`, {
              header: () => (
                <实验表格标题
                  experimentId={experiment表格Id}
                  isOriginal={
                    pv.id ===
                    experiment表格Query?.copied_original_prompt_version
                  }
                  prompt版本Id={pv.id}
                  originalPromptTemplate={prompt版本TemplateData}
                  originalPrompt版本Id={
                    experiment表格Query?.copied_original_prompt_version ?? ""
                  }
                  onForkPrompt版本={(prompt版本Id: string) => {
                    setExternallySelectedForkFromPrompt版本Id(
提示词版本
                    );
                    setIsAdd列对话框Open(true);
                  }}
                />
              ),
              cell: ({ row }) => (
                <假设Cell渲染器
                  ref={(el) => {
                    if (el) {
                      cellRefs.current[`${row.id}-${pv.id}`] = el;
                    }
                  }}
                  experiment表格Id={experiment表格Id}
                  requestId={
                    row.original[`prompt_version_${pv.id}`]?.request_id ?? ""
                  }
                  inputRecordId={row.original.rowRecordId ?? ""}
                  prompt={prompt版本TemplateData}
                  prompt版本Id={pv.id}
                />
              ),
              size: 400,
            }),
          ],
        }),
      ),
      columnHelper.group({
        id: "add_prompt__outer",
        header: () => (
          <Add列标题
            experimentId={experiment表格Id}
            prompt版本Id={
              experiment表格Query?.original_prompt_version ?? ""
            }
            selectedProviderKey={null}
            handleAdd列={async () => {}}
            wrapText={false}
            original列Prompt版本Id={prompt版本sData?.[0]?.id ?? ""}
            experimentPrompt版本s={
              prompt版本sData?.map((pv) => ({
                id: pv.id,
                metadata: pv.metadata ?? {},
                major_version: pv.major_version,
                minor_version: pv.minor_version,
              })) ?? []
            }
            numberOfExistingPrompt版本s={
              prompt版本sData?.length ? prompt版本sData.length - 1 : 0
            }
            disabled={!canCreateVariant}
          />
        ),
        columns: [
          columnHelper.accessor("add_prompt", {
            header: () => <></>,
            cell: ({ row }) => <div></div>,
          }),
        ],
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      inputKeysData,
      prompt版本sData,
      experiment表格Query,
      experiment表格Id,
      prompt版本TemplateData,
      setExternallySelectedForkFromPrompt版本Id,
      setIsAdd列对话框Open,
    ],
  );

  const tableData = useMemo<表格DataType[]>(() => {
    if (!experiment表格Query?.rows || !prompt版本sData) return [];

    return experiment表格Query.rows.map((row, i) => ({
      index: i + 1,
      inputs: row.inputs,
      rowRecordId: row.id,
      ...(prompt版本sData ?? []).reduce(
        (acc, pv) => ({
          ...acc,
          [`prompt_version_${pv.id}`]: row.requests.find(
            (r) => r.prompt_version_id === pv.id,
          ),
        }),
        {},
      ),
      add_prompt: "",
      auto输入s: row.auto_prompt_inputs,
      original输入RecordId:
        row.requests.find(
          (r) =>
            r.prompt_version_id ===
            experiment表格Query?.copied_original_prompt_version,
        )?.input_record_id ?? "",
    }));
  }, [
    experiment表格Query?.rows,
    prompt版本sData,
    experiment表格Query?.copied_original_prompt_version,
  ]);

  const table配置 = useMemo(
    () => ({
      data: tableData,
      columns: columnDef,
      state: {
        rowSelection,
      },
      onRowSelectionChange: setRowSelection,
      default列: {
        minSize: 50,
        maxSize: 1000,
        size: 200,
        enableResizing: true,
      },
      getCoreRowModel: getCoreRowModel(),
      enable列Resizing: true,
      enableRowSelection: true,
      columnResizeMode: "onChange" as const,
    }),
    [tableData, columnDef, rowSelection],
  );

  const table = useReact表格(table配置);

  const handleAddRowInsertBatch = useCallback(
    (
      rows: {
        inputRecordId: string;
        inputs: Record<string, string>;
        auto输入s: any[];
      }[],
    ) => {
      const newRows = rows.map((row) => ({
        inputRecordId: row.inputRecordId,
        inputs: row.inputs,
        auto输入s: row.auto输入s,
      }));

      if (!newRows.length) return;

      add实验表格RowInsertBatch.mutate({
        rows: newRows,
      });
    },
    [add实验表格RowInsertBatch],
  );

  const handleAddRowInsertBatchFrom数据集 = useCallback(
    (datasetId: string) => {
      add实验表格RowInsertFrom数据集Batch.mutate({
        datasetId,
      });
    },
    [add实验表格RowInsertFrom数据集Batch],
  );

  const queryClient = useQueryClient();

  const handleShow评分Change = useCallback(
    (checked: boolean) => {
      if (!checked) {
        queryClient.setQueryData(["selectedScoreKey", experiment表格Id], null);
        queryClient.setQueryData(["experiment评分", experiment表格Id], {});

        for (const prompt版本 of prompt版本sData ?? []) {
          queryClient.setQueryData(
            ["experiment评分", experiment表格Id, prompt版本.id],
            {},
          );
        }
      }
      setShow评分(checked);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, experiment表格Id],
  );

  return (
    <>
      <div className="flex items-center justify-between py-4 pr-4">
        <Island容器>
          <HcBreadcrumb
            pages={[
              {
                href: "/experiments",
                name: "实验s",
              },
              {
                href: `/experiments/${experiment表格Id}`,
                name: experiment表格Query?.name ?? "实验",
              },
            ]}
          />
        </Island容器>
        <div className="flex items-center gap-5">
          {!(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Show scores
              </span>
              <Switch
                checked={show评分}
                onCheckedChange={handleShow评分Change}
              />
              <span className="ml-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                Wrap text
              </span>
              <Switch
                checked={wrapText.data ?? false}
                onCheckedChange={(checked) => {
                  queryClient.setQueryData(
                    ["wrapText", experiment表格Id],
                    checked,
                  );
                }}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                deleteSelectedRows.mutate({
                  inputRecordIds: table
                    .getSelectedRowModel()
                    .rows.map((row) => row.original.rowRecordId),
                });
              }}
            >
              <Trash2Icon className="mr-2 h-4 w-4 text-red-500" />
              Delete {table.getSelectedRowModel().rows.length} rows
            </Button>
          )}
        </div>
      </div>

      {/* Variant limit warning banner */}
      {!canCreateVariant && (
        <FreeTierLimitBanner
          feature="experiments"
          subfeature="variants"
          itemCount={variantCount}
          freeLimit={MAX_VARIANTS}
        />
      )}

      <div className="h-[calc(100vh-50px)]">
        <Resizable面板Group direction="horizontal" className="h-full">
          <Resizable面板 defaultSize={75}>
            <div className="flex w-full flex-col">
              {show评分 && (
                <div className="flex w-full flex-col border-y border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-neutral-950">
                  {prompt版本sData && (
                    <评分图表容器
                      prompt版本s={(prompt版本sData ?? []).map((pv) => ({
                        ...pv,
                        metadata: pv.metadata ?? {},
                      }))}
                      experimentId={experiment表格Id}
                    />
                  )}
                  <div className="flex items-center justify-between bg-white p-2 dark:bg-neutral-950">
                    <评分评估器配置 experimentId={experiment表格Id} />
                  </div>
                </div>
              )}
              <div
                className={clsx(
                  "w-full overflow-x-auto bg-white dark:bg-neutral-950",
                  show评分
                    ? "h-[calc(100vh-90px-300px-50px)]"
                    : "h-[calc(100vh-90px)]",
                )}
              >
                <div
                  className="inline-block h-auto w-max min-w-0 rounded-sm bg-white dark:bg-black"
                  // style={{ width: "fit-content" }}
                >
                  <表格 className="h-[1px] border-collapse border-b border-r border-t border-slate-200 dark:border-slate-800">
                    <表格标题>
                      {table.get标题Groups().map((headerGroup, i) => (
                        <表格Row
                          key={headerGroup.id}
                          className={clsx(
                            "sticky top-0 border-b border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900",
                            i === 1 && "h-[225px]",
                          )}
                        >
                          {headerGroup.headers.map((header, index) => (
                            <表格Head
                              key={header.id}
                              style={{ width: header.getSize() }}
                              className={cn(
                                "relative bg-white p-0 dark:bg-neutral-950",
                                index < headerGroup.headers.length - 1 &&
                                  "border-r border-slate-200 dark:border-slate-800",
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                              <div
                                className="resizer absolute right-0 top-0 h-full w-4 cursor-col-resize"
                                {...{
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                }}
                              >
                                <div
                                  className={clsx(
                                    "h-full w-1",
                                    header.column.getIsResizing()
                                      ? "bg-blue-700 dark:bg-blue-300"
                                      : "bg-gray-500",
                                  )}
                                />
                              </div>
                            </表格Head>
                          ))}
                        </表格Row>
                      ))}
                    </表格标题>
                    <表格Body className="bg-white text-[13px] dark:bg-neutral-950">
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <表格Row
                            onClick={(e) => {
                              if (
                                table.getIsSomeRowsSelected() ||
                                table.getIsAllRowsSelected()
                              ) {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                row.getToggleSelectedHandler()(e);
                              }
                            }}
                            onMouseDown={(e) => {
                              if (
                                table.getIsSomeRowsSelected() ||
                                table.getIsAllRowsSelected()
                              ) {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className={cn(
                              "border-b border-slate-200 hover:bg-white dark:border-slate-800 dark:hover:bg-neutral-950 dark:data-[state=selected]:bg-slate-900",
                              (table.getIsSomeRowsSelected() ||
                                table.getIsAllRowsSelected()) &&
                                "pointer-events-auto cursor-pointer",
                            )}
                          >
                            {row.getVisible单元格().map((cell) => (
                              <表格Cell
                                className={cn(
                                  "group relative h-full border-r border-slate-200 p-0 dark:border-slate-800",
                                  "w-full max-w-0",
                                  cell.column.getIsLast列() && "border-r-0",
                                  (table.getIsSomeRowsSelected() ||
                                    table.getIsAllRowsSelected()) &&
                                    "[&_*]:pointer-events-none",
                                )}
                                style={{
                                  width: cell.column.getSize(),
                                  maxWidth: cell.column.getSize(),
                                }}
                                key={cell.id}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </表格Cell>
                            ))}
                          </表格Row>
                        ))
                      ) : (
                        <表格Row>
                          <表格Cell
                            colSpan={columnDef.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </表格Cell>
                        </表格Row>
                      )}
                    </表格Body>
                  </表格>
                </div>
                <弹出框 open={popoverOpen} onOpenChange={set弹出框Open}>
                  <弹出框Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-0 flex flex-row space-x-2 self-start text-slate-800 shadow-none"
                    >
                      <PlusIcon className="h-4 w-4" />
添加行
                    </Button>
                  </弹出框Trigger>
                  <弹出框Content className="w-full px-2 py-2">
                    <AddRow弹出框
                      set弹出框Open={set弹出框Open}
                      setShowAddManualRow={() => setRight面板("add_manual")}
                      setShow实验输入选择器={
                        setShow实验输入选择器
                      }
                      setShowRandom输入选择器={setShowRandom输入选择器}
                      setShow实验数据集选择器={
                        setShow实验数据集选择器
                      }
                      setShowImportCsvModal={setShowImportCsvModal}
                    />
                  </弹出框Content>
                </弹出框>
              </div>

              <实验Random输入选择器
                open={showRandom输入选择器}
                setOpen={setShowRandom输入选择器}
                handleAddRows={handleAddRowInsertBatch}
                prompt版本Id={
                  experiment表格Query?.original_prompt_version ?? ""
                }
                onSuccess={async (success) => {}}
              />

              <实验输入选择器
                open={show实验输入选择器}
                setOpen={setShow实验输入选择器}
                prompt版本Id={
                  experiment表格Query?.original_prompt_version ?? ""
                }
                handleAddRows={handleAddRowInsertBatch}
                onSuccess={async (success) => {}}
              />

              <实验数据集选择器
                open={show实验数据集选择器}
                setOpen={setShow实验数据集选择器}
                experimentId={experiment表格Id}
                prompt版本Id={
                  experiment表格Query?.original_prompt_version ?? ""
                }
                handleAddRows={handleAddRowInsertBatchFrom数据集}
                onSuccess={async (success) => {}}
              />
            </div>
          </Resizable面板>

          {/* Add right panel if needed */}
          {right面板 && (
            <>
              <ResizableHandle withHandle />
              <Resizable面板 minSize={25} maxSize={75}>
                <div className="flex h-full flex-shrink-0 flex-col">
                  {right面板 === "edit_inputs" && (
                    <Edit输入s面板
                      experimentId={experiment表格Id}
                      inputRecord={toEdit输入Record}
                      inputKeys={inputKeysData ?? []}
                      auto输入s={toEdit输入Record?.auto输入s ?? {}}
                      onClose={() => {
                        setToEdit输入Record(null);
                        setRight面板(null);
                      }}
                    />
                  )}
                  {right面板 === "add_manual" && (
                    <AddManualRow面板
                      experimentId={experiment表格Id}
                      inputKeys={inputKeysData ?? []}
                      onClose={() => setRight面板(null)}
                    />
                  )}
                </div>
              </Resizable面板>
            </>
          )}
        </Resizable面板Group>
        <Add列对话框
          isOpen={isAdd列对话框Open}
          onOpenChange={setIsAdd列对话框Open}
          experimentId={experiment表格Id}
          original列Prompt版本Id={prompt版本sData?.[0]?.id ?? ""}
          selectedForkFromPrompt版本Id={
            externallySelectedForkFromPrompt版本Id ?? ""
          }
          numberOfExistingPrompt版本s={
            prompt版本sData?.length ? prompt版本sData.length - 1 : 0
          }
        />
        <ImportCSV对话框
          open={showImportCsvModal}
          onOpenChange={setShowImportCsvModal}
          experimentId={experiment表格Id}
          experimentPrompt输入Keys={inputKeysData?.map((key) => key) ?? []}
        />
      </div>
    </>
  );
}
