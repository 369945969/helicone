import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Download } from "lucide-react";
import { useState } from "react";
import useNotification from "../../shared/notification/useNotification";
import { logger } from "@/lib/telemetry/logger";
import {
  DashboardExportData,
  exportDashboardToExcel,
} from "@/lib/exportDashboardData";

interface DashboardExportButtonProps {
  data: DashboardExportData;
  timeFilter: {
    start: Date;
    end: Date;
  };
  disabled?: boolean;
}

export default function DashboardExportButton({
  data,
  timeFilter,
  disabled = false,
}: DashboardExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { setNotification } = useNotification();

  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from closing
    setExporting(true);
    try {
      const excelBlob = await exportDashboardToExcel(data, timeFilter);

      // Create download link
      const objectUrl = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = objectUrl;

      // Format filename with date range
      const startDate = timeFilter.start.toISOString().split("T")[0];
      const endDate = timeFilter.end.toISOString().split("T")[0];
      link.download = `helicone-dashboard-${startDate}-to-${endDate}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL to prevent memory leak
      URL.revokeObjectURL(objectUrl);

      setNotification("Dashboard data exported successfully!", "success");
      setOpen(false);
    } catch (error) {
      logger.error({ error }, "Error exporting dashboard data");
      setNotification(
        "Error exporting dashboard data. Please try again.",
        "error",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            <Download size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>导出仪表板</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>导出仪表板</AlertDialogTitle>
            <AlertDialogDescription>
              {timeFilter.start.toLocaleDateString()} -{" "}
              {timeFilter.end.toLocaleDateString()}
            </AlertDialogDescription>
            <AlertDialogDescription>
              所有仪表板数据作为 Excel 文件，包含单独的指标、成本、请求等标签页。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={exporting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导出中...
                </>
              ) : (
                "导出"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
