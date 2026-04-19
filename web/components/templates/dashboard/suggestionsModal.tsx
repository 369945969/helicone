import { $JAWN_API } from "@/lib/clients/jawn";
import { useHeliconeAuthClient } from "@/packages/common/auth/client/AuthClientFactory";
import { useEffect, useState } from "react";
import useNotification from "../../shared/notification/useNotification";
import ThemedModal from "../../shared/themed/themedModal";

interface SuggestionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SuggestionModal = (props: SuggestionModalProps) => {
  const { open, setOpen } = props;
  const [metricTitle, setMetricTitle] = useState("");
  const [metricType, setMetricType] = useState("");
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [whatElse, setWhatElse] = useState("");
  const heliconeAuthClient = useHeliconeAuthClient();
  useEffect(() => {
    setEmail(heliconeAuthClient?.user?.email ?? "");
  }, [heliconeAuthClient?.user?.email]);

  const { setNotification } = useNotification();
  return (
    <ThemedModal open={open} setOpen={setOpen}>
      <div className="w-[35em]">
        <div className="mt-16 h-full w-full space-y-4 rounded-xl border border-gray-300 bg-gray-50 p-8 lg:mt-0">
          <div>
            <label
              htmlFor="metric-name"
              className="lg:text-md block text-sm font-medium leading-6 text-gray-900"
            >
              指标标题
            </label>
            <div className="mt-1">
              <input
                onChange={(e) => setMetricTitle(e.target.value)}
                id="metric-title"
                name="metric-title"
                type="text"
                placeholder="例如：每次请求的平均令牌数"
                required
                className="lg:text-md block w-full rounded-md border-0 py-1.5 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:leading-6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="metric-type"
              className="lg:text-md block text-sm font-medium leading-6 text-gray-900"
            >
              类型
            </label>
            <div className="mt-1">
              <input
                onChange={(e) => setMetricType(e.target.value)}
                id="metric-type"
                name="metric-type"
                type="text"
                placeholder="时间图表 | 数字 | 其他"
                required
                className="lg:text-md block w-full rounded-md border-0 py-1.5 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:leading-6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="lg:text-md block text-sm font-medium leading-6 text-gray-900"
            >
              电子邮件地址
            </label>
            <div className="mt-1">
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={heliconeAuthClient?.user?.email}
                required
                className="lg:text-md block w-full rounded-md border-0 py-1.5 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:leading-6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="use-case"
              className="lg:text-md block text-sm font-medium leading-6 text-gray-900"
            >
              使用案例
            </label>
            <div className="mt-1">
              <input
                onChange={(e) => setUseCase(e.target.value)}
                id="use-case"
                name="use-case"
                type="text"
                required
                placeholder="例如：监控我们离 OpenAI API 限制有多近。"
                className="lg:text-md block w-full rounded-md border-0 py-1.5 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:leading-6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="what-else"
              className="lg:text-md block text-sm font-medium leading-6 text-gray-900"
            >
              还有什么我们应该知道的？
            </label>
            <div className="mt-1">
              <textarea
                onChange={(e) => setWhatElse(e.target.value)}
                id="what-else"
                name="what-else"
                required
                rows={4}
                placeholder={"您好"}
                className="lg:text-md block w-full rounded-md border-0 py-1.5 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:leading-6"
              />
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-gray-300 pt-4">
            <button
              onClick={() => {
                $JAWN_API
                  .POST("/v1/user-feedback", {
                    body: {
                      feedback: `
                    指标标题: ${metricTitle}
                    类型: ${metricType}
                    邮箱: ${email}
                    使用案例: ${useCase}
                    其他信息: ${whatElse}
                  `,
                      tag: "dashboard_metric_suggestion",
                    },
                  })
                  .then((res) => {
                    if (res.error) {
                      setNotification(
                        "提交反馈失败，请重试。",
                        "error",
                      );
                      return;
                    } else {
                      setOpen(false);
                      setNotification(
                        "感谢您的反馈！",
                        "success",
                      );
                    }
                  });
              }}
              className="flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              提交
            </button>
          </div>
        </div>
      </div>
    </ThemedModal>
  );
};

export default SuggestionModal;
