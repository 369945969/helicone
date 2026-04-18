import { useState, useMemo } from "react";
import { useOrg } from "../../layout/org/organizationContext";
import useAlertsPage from "./useAlertsPage";
import { CreateAlertModal, EditAlertModal } from "./createAlertModal";
import DeleteAlertModal from "./deleteAlertModal";
import { SimpleTable } from "@/components/shared/table/simpleTable";
import { Database } from "../../../db/database.types";
import { getUSDate } from "../../shared/utils/utils";
import { useGetOrgSlackChannels } from "@/services/hooks/organizations";
import { alertTimeWindows } from "./constant";
import LoadingAnimation from "@/components/shared/loadingAnimation";
import { useFeatureLimit } from "@/hooks/useFreeTierLimit";
import { FreeTierLimitWrapper } from "@/components/shared/FreeTierLimitWrapper";
import { FreeTierLimitBanner } from "@/components/shared/FreeTierLimitBanner";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/shared/helicone/EmptyStateCard";
import {
  AlertMetric,
  AlertAggregation,
} from "@helicone-package/filters/alerts";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Header from "@/components/shared/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/services/hooks/localStorage";
import TableFooter from "../requests/tableFooter";
import AlertStatusPill from "./alertStatusPill";

const TABS = [
  { id: "alerts", label: "警报" },
  { id: "history", label: "历史" },
];

const AlertsPage = () => {
  const [createNewAlertModal, setCreateNewAlertModal] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] =
    useState<Database["public"]["Tables"]["alert"]["Row"]>();
  const [currentTab, setCurrentTab] = useLocalStorage<string>(
    "alertsPageActiveTab",
    "alerts",
  );
  const [alertsCurrentPage, setAlertsCurrentPage] = useState<number>(1);
  const [alertsPageSize, setAlertsPageSize] = useState<number>(25);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [historyPageSize, setHistoryPageSize] = useState<number>(25);

  const orgContext = useOrg();

  const { alertHistory, alerts, historyTotalCount, isLoading, refetch } =
    useAlertsPage(
      orgContext?.currentOrg?.id || "",
      historyCurrentPage - 1,
      historyPageSize,
    );

  const { data: slackChannelsData, isLoading: isLoadingSlackChannels } =
    useGetOrgSlackChannels(orgContext?.currentOrg?.id || "");

  const slackChannels: {
    id: string;
    name: string;
  }[] = [...(slackChannelsData?.data || [])];
  // Free tier limit checks
  const alertCount = alerts?.length || 0;
  const { canCreate: canCreateAlert, freeLimit: MAX_ALERTS } = useFeatureLimit(
    "alerts",
    alertCount,
  );

  const isOrgLoading = !orgContext || !orgContext.currentOrg;
  const isPageLoading = isLoading || isLoadingSlackChannels || isOrgLoading;

  function formatTimeWindow(milliseconds: number): string {
    let closest = Object.keys(alertTimeWindows).reduce((a, b) => {
      return Math.abs(alertTimeWindows[a] - milliseconds) <
        Math.abs(alertTimeWindows[b] - milliseconds)
        ? a
        : b;
    });

    return closest;
  }

  function formatThreshold(metric: string, threshold: number): string {
    if (metric === "response.status") {
      return `${threshold}%`;
    }
    if (metric === "cost") {
      return `$${Number(threshold).toFixed(2)}`;
    }
    // For all other metrics (latency, tokens, count), just show the number
    return threshold.toString();
  }

  function formatAggregation(
    metric: string,
    aggregation: AlertAggregation | null,
  ): string {
    if (metric === "response.status") {
      return "rate";
    }
    if (metric === "count") {
      return "count";
    }
    return aggregation || "sum";
  }

  function formatMetric(metric: string): string {
    const metricLabels: Record<AlertMetric, string> = {
      "response.status": "状态",
      cost: "成本",
      latency: "延迟 (毫秒)",
      total_tokens: "总令牌数",
      prompt_tokens: "提示词令牌数",
      completion_tokens: "补全令牌数",
      prompt_cache_read_tokens: "提示缓存读取令牌数",
      prompt_cache_write_tokens: "提示缓存写入令牌数",
      count: "计数",
    };
    return metricLabels[metric as AlertMetric] || metric;
  }

  // Paginate alerts in memory (preserves SimpleTable sorting)
  const paginatedAlerts = useMemo(() => {
    const startIndex = (alertsCurrentPage - 1) * alertsPageSize;
    const endIndex = startIndex + alertsPageSize;
    return (alerts ?? []).slice(startIndex, endIndex);
  }, [alerts, alertsCurrentPage, alertsPageSize]);

  const handleCreateAlert = () => {
    setCreateNewAlertModal(true);
  };

  if (!isPageLoading && alertCount === 0) {
    return (
      <div className="flex h-screen w-full flex-col bg-background dark:bg-sidebar-background">
        <div className="flex h-full flex-1">
          <EmptyStateCard feature="alerts" onPrimaryClick={handleCreateAlert} />
        </div>
        <CreateAlertModal
          open={createNewAlertModal}
          setOpen={setCreateNewAlertModal}
          onSuccess={() => refetch()}
        />
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <LoadingAnimation height={175} width={175} title="正在加载警报..." />
      </div>
    );
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => setCurrentTab(value)}
      className="w-full"
    >
      <div className="flex h-screen w-full flex-col bg-background dark:bg-sidebar-background">
        <Header
          title="警报"
          rightActions={[
            <FreeTierLimitWrapper
              key="create-alert"
              feature="alerts"
              itemCount={alertCount}
            >
              <Button
                variant="default"
                size="sm"
                className="text-xs"
                onClick={handleCreateAlert}
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                创建
              </Button>
            </FreeTierLimitWrapper>,
            <TabsList key="tabs">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>,
          ]}
        />

        <TabsContent value="alerts" className="m-0 flex-1 overflow-y-auto">
          {!canCreateAlert && (
            <div className="border-b border-border p-4">
              <FreeTierLimitBanner
                feature="alerts"
                itemCount={alertCount}
                freeLimit={MAX_ALERTS}
              />
            </div>
          )}

          <div className="flex h-full flex-col border-b border-border">
            <div className="flex-1 overflow-auto">
              <SimpleTable
                data={paginatedAlerts}
                columns={[
                  {
                    key: undefined,
                    header: "操作",
                    render: (alert) => (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md bg-muted p-2 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => {
                            setEditAlertOpen(true);
                            setSelectedAlert(alert);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md bg-destructive/10 p-2 text-xs text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => {
                            setDeleteAlertOpen(true);
                            setSelectedAlert(alert);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                    sortable: false,
                    minSize: 120,
                  },
                  {
                    key: "name",
                    header: "名称",
                    render: (alert) => (
                      <p className="text-sm font-semibold">{alert.name}</p>
                    ),
                    sortable: true,
                  },
                  {
                    key: "status",
                    header: "状态",
                    render: (alert) => (
                      <AlertStatusPill
                        status={alert.status as "resolved" | "triggered"}
                        displayText={
                          alert.status === "resolved" ? "正常" : "已触发"
                        }
                      />
                    ),
                    sortable: true,
                  },
                  {
                    key: "created_at",
                    header: "创建时间",
                    render: (alert) => (
                      <p className="text-sm text-muted-foreground">
                        {getUSDate(new Date(alert.created_at || ""))}
                      </p>
                    ),
                    sortable: true,
                  },
                  {
                    key: "metric",
                    header: "指标",
                    render: (alert) => (
                      <Badge variant="helicone">
                        {formatMetric(alert.metric)}
                      </Badge>
                    ),
                    sortable: true,
                  },
                  {
                    key: undefined,
                    header: "聚合",
                    render: (alert) => (
                      <p className="text-sm">
                        {formatAggregation(
                          alert.metric,
                          (alert as any).aggregation as AlertAggregation | null,
                        )}
                      </p>
                    ),
                    sortable: false,
                  },
                  {
                    key: "threshold",
                    header: "阈值",
                    render: (alert) => (
                      <p className="text-sm">
                        {formatThreshold(alert.metric, alert.threshold)}
                      </p>
                    ),
                    sortable: true,
                  },
                  {
                    key: undefined,
                    header: "分组",
                    render: (alert) => (
                      <p className="text-sm">
                        {(alert as any).grouping
                          ? (alert as any).grouping
                          : "—"}
                      </p>
                    ),
                    sortable: false,
                  },
                  {
                    key: "time_window",
                    header: "时间窗口",
                    render: (alert) => (
                      <p className="text-sm">
                        {formatTimeWindow(alert.time_window)}
                      </p>
                    ),
                    sortable: true,
                  },
                  {
                    key: "minimum_request_count",
                    header: "最小请求数",
                    render: (alert) => (
                      <p className="text-sm">
                        {alert.minimum_request_count || 0}
                      </p>
                    ),
                    sortable: true,
                  },
                  {
                    key: "filter",
                    header: "筛选",
                    render: (alert) => (
                      <p className="text-sm">{alert.filter ? "是" : "否"}</p>
                    ),
                    sortable: false,
                  },
                  {
                    key: "emails",
                    header: "邮箱",
                    render: (alert) => (
                      <div className="flex text-sm">
                        {alert.emails.join(", ")}
                      </div>
                    ),
                    sortable: false,
                    minSize: 200,
                  },
                  {
                    key: "slack_channels",
                    header: "Slack 频道",
                    render: (alert) => (
                      <div className="flex text-sm">
                        {alert.slack_channels
                          .map(
                            (channel) =>
                              slackChannels?.find(
                                (slackChannel) => slackChannel.id === channel,
                              )?.name,
                          )
                          .join(", ")}
                      </div>
                    ),
                    sortable: false,
                    minSize: 200,
                  },
                ]}
                defaultSortKey="created_at"
                defaultSortDirection="desc"
              />
            </div>
            <TableFooter
              currentPage={alertsCurrentPage}
              pageSize={alertsPageSize}
              count={alerts?.length || 0}
              isCountLoading={isLoading}
              onPageChange={(newPage) => setAlertsCurrentPage(newPage)}
              onPageSizeChange={(newPageSize) => {
                setAlertsPageSize(newPageSize);
                setAlertsCurrentPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              showCount={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0 flex-1 overflow-y-auto">
          {alertHistory.length === 0 ? (
            <div className="border-2 border-dashed border-border bg-muted p-8 text-center">
              <FileText
                size={24}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-xs font-medium">
                尚未触发任何警报
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-auto">
                <SimpleTable
                  data={alertHistory ?? []}
                  columns={[
                    {
                      key: "status",
                      header: "状态",
                      render: (history) => (
                        <AlertStatusPill
                          status={history.status as "resolved" | "triggered"}
                        />
                      ),
                      sortable: true,
                    },
                    {
                      key: "alert_name",
                      header: "名称",
                      render: (history) => (
                        <p className="text-sm font-semibold">
                          {history.alert_name}
                        </p>
                      ),
                      sortable: true,
                    },
                    {
                      key: "alert_start_time",
                      header: "开始时间",
                      render: (history) => (
                        <p className="text-sm">
                          {getUSDate(new Date(history.alert_start_time))}
                        </p>
                      ),
                      sortable: true,
                    },
                    {
                      key: "alert_end_time",
                      header: "结束时间",
                      render: (history) => (
                        <p className="text-sm">
                          {history.alert_end_time
                            ? getUSDate(new Date(history.alert_end_time))
                            : "—"}
                        </p>
                      ),
                      sortable: true,
                    },
                    {
                      key: "triggered_value",
                      header: "触发值",
                      render: (history) => (
                        <p className="text-sm">
                          {formatThreshold(
                            history.alert_metric,
                            Number(history.triggered_value),
                          )}
                        </p>
                      ),
                      sortable: true,
                    },
                  ]}
                  defaultSortKey="alert_start_time"
                  defaultSortDirection="desc"
                />
              </div>
              <TableFooter
                currentPage={historyCurrentPage}
                pageSize={historyPageSize}
                count={historyTotalCount}
                isCountLoading={isLoading}
                onPageChange={(newPage) => setHistoryCurrentPage(newPage)}
                onPageSizeChange={(newPageSize) => {
                  setHistoryPageSize(newPageSize);
                  setHistoryCurrentPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                showCount={false}
              />
            </div>
          )}
        </TabsContent>
      </div>

      {/* Modals */}
      <CreateAlertModal
        open={createNewAlertModal}
        setOpen={setCreateNewAlertModal}
        onSuccess={() => {
          refetch();
        }}
      />
      <EditAlertModal
        open={editAlertOpen}
        setOpen={setEditAlertOpen}
        onSuccess={() => {
          refetch();
        }}
        currentAlert={selectedAlert}
      />
      <DeleteAlertModal
        open={deleteAlertOpen}
        setOpen={setDeleteAlertOpen}
        onSuccess={() => {
          refetch();
        }}
        alertId={selectedAlert?.id || ""}
      />
    </Tabs>
  );
};

export default AlertsPage;
