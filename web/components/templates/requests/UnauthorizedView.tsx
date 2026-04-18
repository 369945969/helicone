import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface UnauthorizedViewProps {
  currentTier: string;
  pageType?: "requests" | "cache" | "ratelimit";
}

const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  currentTier,
  pageType = "requests",
}) => {
  const getMessage = () => {
    if (pageType === "cache") {
      return {
        title: "您已达到月度限制。",
        description:
          "升级您的计划以查看缓存数据。您的缓存仍在运行，但升级前无法查看分析数据。",
      };
    } else if (pageType === "ratelimit") {
      return {
        title: "您已达到月度限制。",
        description:
          "升级您的计划以查看速率限制数据。速率限制仍在执行，但升级前无法查看。",
      };
    } else {
      return {
        title: "您已达到月度限制。",
        description:
          "升级您的计划以查看请求页面。您的请求仍在处理中，但升级前无法查看。",
      };
    }
  };

  const { title, description } = getMessage();

  if (currentTier === "free") {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center">
        <div className="flex w-2/5 flex-col">
          <HomeIcon className="h-12 w-12 rounded-lg border border-gray-300 bg-white p-2 text-black dark:border-gray-700 dark:bg-black dark:text-white" />
          <p className="mt-8 text-xl font-semibold text-black dark:text-white">
            {title}
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
          <div className="mt-4">
            <Link
              href="/settings/billing"
              className="flex w-min items-center gap-2 whitespace-nowrap rounded-lg bg-black px-2.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              升级 - 开始免费试用
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (currentTier === "pro") {
    const proTitle =
      pageType === "cache"
        ? "在 Pro 计划上您已达到月度缓存限制。"
        : "在 Pro 计划上您已达到月度限制。";

    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center">
        <div className="flex w-full flex-col">
          <HomeIcon className="h-12 w-12 rounded-lg border border-gray-300 bg-white p-2 text-black dark:border-gray-700 dark:bg-black dark:text-white" />
          <p className="mt-8 text-xl font-semibold text-black dark:text-white">
            {proTitle}
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            请联系我们讨论增加限制。
          </p>
          <div className="mt-4">
            <Link
              href="https://cal.com/team/helicone/helicone-discovery"
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-2 rounded-lg bg-black px-2.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default UnauthorizedView;
