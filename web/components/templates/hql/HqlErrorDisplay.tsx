import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import { HqlErrorCode, parseHqlError } from "@/lib/api/hql/errorTypes";

interface HqlErrorDisplayProps {
  error: string | null;
  className?: string;
}

interface ErrorDisplay {
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  icon: React.ComponentType<{ className?: string }>;
  suggestions?: string[];
}

// Map error codes to user-friendly display information
const ERROR_DISPLAY_MAP: Record<
  HqlErrorCode,
  Omit<ErrorDisplay, "description">
> = {
  // SQL Validation Errors
  [HqlErrorCode.INVALID_STATEMENT]: {
    title: "无效的 SQL 语句",
    severity: "error",
    icon: XCircle,
    suggestions: [
      "仅允许 SELECT 语句",
      "删除任何 INSERT、UPDATE、DELETE 或 DDL 语句",
    ],
  },
  [HqlErrorCode.INVALID_TABLE]: {
    title: "无效的表",
    severity: "error",
    icon: XCircle,
    suggestions: [
      "检查查询中的表名",
      "只能查询已授权的表",
    ],
  },
  [HqlErrorCode.SYNTAX_ERROR]: {
    title: "SQL 语法错误",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: [
      "检查您的 SQL 语法",
      "验证所有关键字拼写正确",
      "确保引号和括号平衡",
    ],
  },
  [HqlErrorCode.SQL_INJECTION_ATTEMPT]: {
    title: "安全违规",
    severity: "error",
    icon: XCircle,
  },

  // Query Execution Errors
  [HqlErrorCode.QUERY_TIMEOUT]: {
    title: "查询超时",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: [
      "添加更具体的过滤器以减少数据",
      "使用 LIMIT 限制结果",
      "优化您的 WHERE 条件",
    ],
  },
  [HqlErrorCode.MEMORY_LIMIT_EXCEEDED]: {
    title: "超出内存限制",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: [
      "减少选择的列数",
      "添加日期范围过滤器",
      "使用聚合而不是原始数据",
    ],
  },
  [HqlErrorCode.ROW_LIMIT_EXCEEDED]: {
    title: "行数过多",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: [
      "添加更多 WHERE 条件",
      "使用较小的日期范围",
      "在查询中应用 LIMIT",
    ],
  },
  [HqlErrorCode.RESULT_LIMIT_EXCEEDED]: {
    title: "结果集过大",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: [
      "添加 LIMIT 子句（最多 10,000 行）",
      "对于较大的数据集导出为 CSV",
    ],
  },
  [HqlErrorCode.UNKNOWN_COLUMN]: {
    title: "未知列",
    severity: "error",
    icon: XCircle,
    suggestions: [
      "根据模式检查列名",
      "使用表面板查看可用列",
      "列名区分大小写",
    ],
  },
  [HqlErrorCode.EXECUTION_FAILED]: {
    title: "查询执行失败",
    severity: "error",
    icon: XCircle,
  },

  // Data Errors
  [HqlErrorCode.NO_DATA_RETURNED]: {
    title: "未找到数据",
    severity: "info",
    icon: AlertCircle,
    suggestions: [
      "调整您的过滤器",
      "检查日期范围",
      "验证表包含数据",
    ],
  },
  [HqlErrorCode.SCHEMA_FETCH_FAILED]: {
    title: "模式加载失败",
    severity: "error",
    icon: XCircle,
  },

  // Saved Query Errors
  [HqlErrorCode.QUERY_NOT_FOUND]: {
    title: "未找到查询",
    severity: "warning",
    icon: AlertTriangle,
  },
  [HqlErrorCode.QUERY_NAME_EXISTS]: {
    title: "重复的查询名称",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: ["为您的查询选择一个不同的名称"],
  },
  [HqlErrorCode.QUERY_ACCESS_DENIED]: {
    title: "访问被拒绝",
    severity: "error",
    icon: XCircle,
  },

  // Validation Errors
  [HqlErrorCode.MISSING_QUERY_ID]: {
    title: "缺少查询 ID",
    severity: "error",
    icon: XCircle,
  },
  [HqlErrorCode.MISSING_QUERY_NAME]: {
    title: "需要查询名称",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: ["为您的查询输入一个名称"],
  },
  [HqlErrorCode.MISSING_QUERY_SQL]: {
    title: "需要 SQL",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: ["输入一个 SQL 查询"],
  },
  [HqlErrorCode.QUERY_NAME_TOO_LONG]: {
    title: "查询名称过长",
    severity: "warning",
    icon: AlertTriangle,
    suggestions: ["使用较短的名称（最多 255 个字符）"],
  },

  // Export Errors
  [HqlErrorCode.CSV_UPLOAD_FAILED]: {
    title: "CSV 导出失败",
    severity: "error",
    icon: XCircle,
    suggestions: ["重试", "检查您的网络连接"],
  },
  [HqlErrorCode.CSV_URL_NOT_RETURNED]: {
    title: "导出 URL 错误",
    severity: "error",
    icon: XCircle,
  },

  // Feature Access Errors
  [HqlErrorCode.FEATURE_NOT_ENABLED]: {
    title: "功能不可用",
    severity: "error",
    icon: XCircle,
    suggestions: ["联系您的管理员启用 HQL 访问权限"],
  },

  // Generic Errors
  [HqlErrorCode.UNEXPECTED_ERROR]: {
    title: "意外错误",
    severity: "error",
    icon: XCircle,
    suggestions: ["重试", "如果问题持续存在，请联系支持"],
  },
};

const getErrorDetails = (errorString: string): ErrorDisplay => {
  const hqlError = parseHqlError(errorString);

  // If we have a known error code, use the mapping
  if (hqlError.code && ERROR_DISPLAY_MAP[hqlError.code]) {
    const display = ERROR_DISPLAY_MAP[hqlError.code];
    return {
      ...display,
      description: hqlError.details || hqlError.message,
    };
  }

  // Fallback for unknown errors
  return {
    title: "查询错误",
    description: hqlError.message,
    severity: "error",
    icon: XCircle,
  };
};

export function HqlErrorDisplay({ error, className }: HqlErrorDisplayProps) {
  if (!error) return null;

  const {
    title,
    description,
    severity,
    icon: Icon,
    suggestions,
  } = getErrorDetails(error);

  return (
    <Alert
      variant={
        severity === "error"
          ? "destructive"
          : severity === "info"
            ? "default"
            : "default"
      }
      className={className}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{description}</p>
        {suggestions && suggestions.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-sm font-medium">Suggestions:</p>
            <ul className="list-inside list-disc space-y-1 text-sm opacity-90">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default HqlErrorDisplay;
