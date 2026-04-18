import { useLocalStorage } from "@/services/hooks/localStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

interface StreamWarningProps {
  requestWithStreamUsage: boolean;
}

const StreamWarning: React.FC<StreamWarningProps> = ({
  requestWithStreamUsage,
}) => {
  const [isWarningHidden, setIsWarningHidden] = useLocalStorage(
    "isStreamWarningHiddenx",
    requestWithStreamUsage,
  );

  if (!requestWithStreamUsage || isWarningHidden) {
    return null;
  }

  return (
    <Alert variant="warning" className="w-full">
      <div className="flex items-center justify-between">
        <AlertDescription className="text-muted-foreground">
          我们无法准确计算您的成本，因为您的消息中未包含&apos;stream_usage&apos;选项。
          请参考{" "}
          <Link
            href="https://docs.helicone.ai/use-cases/enable-stream-usage"
            className="font-medium underline underline-offset-4"
          >
            此文档
          </Link>{" "}
          获取更多信息。
        </AlertDescription>
        <Button
          onClick={() => setIsWarningHidden(true)}
          variant="ghost"
          size="icon"
          className="mx-5 h-6 w-6"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">关闭</span>
        </Button>
      </div>
    </Alert>
  );
};

export default StreamWarning;
