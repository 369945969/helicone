import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";

export const Deprecated = ({ feature }: { feature: string }) => {
  return (
    <div className="px-4 py-2">
      <Alert className="w-full">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle className="font-semibold">弃用通知</AlertTitle>
        <AlertDescription>
          我们正在弃用 {feature} 功能，它将在{" "}
          <span className="font-semibold">2025年9月1日</span>从平台中移除。
        </AlertDescription>
      </Alert>
    </div>
  );
};
