import { useState } from "react";
import { useOrgPlanPage } from "../organization/plan/useOrgPlanPage";
import {
  addMonths,
  endOfMonth,
  formatISO,
  isAfter,
  startOfMonth,
  subMonths,
} from "date-fns";
import { BarChart } from "@tremor/react";
import { getTimeMap } from "../../../lib/timeCalculations/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useNotification from "../../shared/notification/useNotification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RateLimitPage = () => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const timeIncrement = "day";

  const startOfMonthFormatted = formatISO(currentMonth, {
    representation: "date",
  });
  const endOfMonthFormatted = formatISO(endOfMonth(currentMonth), {
    representation: "date",
  });

  const {
    overTimeData,
    metrics,
    refetch: refetchData,
    isLoading,
  } = useOrgPlanPage({
    timeFilter: {
      start: currentMonth,
      end: endOfMonth(currentMonth),
    },
    timeZoneDifference: 0,
    dbIncrement: timeIncrement,
  });

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => startOfMonth(addMonths(prevMonth, 1)));
  };

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => startOfMonth(subMonths(prevMonth, 1)));
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long" });
  };

  const isNextMonthDisabled = isAfter(addMonths(currentMonth, 1), new Date());
  const { setNotification } = useNotification();

  return (
    <div className="container mx-auto space-y-8 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-3xl font-bold">
              {getMonthName(startOfMonthFormatted)}
            </CardTitle>
            {!isNextMonthDisabled && (
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-semibold">
            您的请求永远不会被丢弃，始终会返回给客户端。Helicone 将竭尽全力确保用户获得其请求。
          </p>
          <p className="text-muted-foreground">
            以下是您组织上月速率限制{" "}
            <span className="font-semibold">记录</span> 事件的摘要。这仅表明您的某些请求已被处理但未在仪表板中记录，因为达到了速率限制 - 如果您想提高速率限制，请随时通过{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => {
                navigator.clipboard.writeText("sales@helicone.ai");
                setNotification("邮箱已复制到剪贴板", "success");
              }}
            >
              sales@helicone.ai
            </Button>
            联系我们。
          </p>
        </CardContent>
      </Card>

      {!isLoading && metrics.totalRateLimits.data && (
        <Card>
        <CardHeader>
          <CardTitle>本月速率限制</CardTitle>
        </CardHeader>
          <CardContent>
            <BarChart
              className="h-[14rem]"
              data={
                overTimeData.rateLimits.data?.data?.map((r) => ({
                  date: getTimeMap(timeIncrement)(r.time),
                  "rate-limits": r.count,
                })) ?? []
              }
              index="date"
              categories={["rate-limits"]}
              colors={["cyan"]}
              showYAxis={false}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>速率限制等级</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>层级</TableHead>
                <TableHead>速率限制</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>免费</TableCell>
                <TableCell>834 日志 / 5 秒</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>专业版</TableCell>
                <TableCell>8334 日志 / 5 秒</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>企业版</TableCell>
                <TableCell>自定义</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RateLimitPage;
