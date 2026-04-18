import FeaturePreview, { PricingPlan } from "../featurePreview/featurePreview";
import { Feature } from "../featurePreview/featurePreviewSection";
import useNotification from "@/components/shared/notification/useNotification";
import { useMemo, useState } from "react";
import { useFeatureTrial } from "@/hooks/useFeatureTrial";
import { TrialConfirmationDialog } from "@/components/shared/TrialConfirmationDialog";
import EvaluateSVG from "@/components/ui/evaluate";
import { useOrg } from "@/components/layout/org/organizationContext";

const evalFeatures: Feature[] = [
  {
    title: "部署前捕获回归",
    description: [
      "三种评估模式：LLM-as-a-Judge、可执行 Python (CodeSandbox) 和 LastMileAI RAG 评估",
      "利用 LastMileAI 的 RAG 特定指标，包括忠实度、相关性和答案质量评分",
      "集成所有主要 AI 提供商 (Anthropic、OpenAI、Google、Meta、DeepSeek)",
    ],
    media: {
      type: "component",
      component: () => <EvaluateSVG />,
      fallbackImage: "/static/features/evals/feature1.png",
    },
    imageAlt: "Evaluation interface showing regression testing",
    isImageLeft: true,
    ctaText: "开始评估",
  },
  {
    title: "在线评估与生产监控",
    description: [
      "将评估附加到任何筛选器（提示词、环境等），支持可配置的采样率",
      "实时仪表板跟踪评估性能以及请求指标",
      "跨模型版本和提示词迭代比较结果",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/online_evals.mp4",
      fallbackImage: "/static/features/evals/feature2.png",
    },
    imageAlt: "Production monitoring and evaluation interface",
    ctaText: "配置监控",
  },
  {
    title: "用于实验的离线评估",
    description: [
      "与实验集成以进行部署前验证",
      "在开发和生产之间保持评估一致性",
      "针对历史数据或合成数据集批量测试提示词",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/evals_experiments.mp4",
      fallbackImage: "/static/features/evals/feature4.png",
    },
    imageAlt: "Offline evaluation interface",
    isImageLeft: true,
    ctaText: "防止回归",
  },
];

type EvalsPricingPlanName = "Evals" | "Pro + Eval" | "Team Bundle";

const freePlan: PricingPlan<EvalsPricingPlanName>[] = [
  {
    name: "Pro + Eval",
    price: "100",
    isSelected: true,
    priceSubtext: "+$20/seat",
    features: [
      { name: "$20/seat", included: true },
      { name: "Evals", included: true },
      { name: "Prompts (+$50/mo)", included: false },
      { name: "Experiments (+$50/mo)", included: false },
    ],
  },
  {
    name: "Team Bundle",
    price: "200",
    features: [
      { name: "Unlimited seats", included: true },
      { name: "Evals", included: true },
      { name: "Prompts", included: true },
      { name: "Experiments", included: true },
    ],
  },
];

const paidPlan: PricingPlan<EvalsPricingPlanName>[] = [
  {
    name: "Evals",
    price: "100",
    isSelected: true,
    features: [
      { name: "Pro seats (current plan)", included: true },
      { name: "Evals", included: true },
      { name: "Prompts (+$50/mo)", included: false },
      { name: "Experiments (+$50/mo)", included: false },
    ],
  },
  {
    name: "Team Bundle",
    price: "200",
    features: [
      { name: "Unlimited seats", included: true },
      { name: "Evals", included: true },
      { name: "Prompts", included: true },
      { name: "Experiments", included: true },
    ],
  },
];

const EvalsPreview = () => {
  const org = useOrg();
  const notification = useNotification();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { handleConfirmTrial } = useFeatureTrial("evals", "Evals");
  const [selectedPlan, setSelectedPlan] = useState<EvalsPricingPlanName>();

  const isPaidPlan = useMemo(
    () =>
      org?.currentOrg?.tier === "enterprise" ||
      org?.currentOrg?.tier === "pro-20240913" ||
      org?.currentOrg?.tier === "pro-20250202" ||
      org?.currentOrg?.tier === "pro-20251210" ||
      org?.currentOrg?.tier === "team-20250130" ||
      org?.currentOrg?.tier === "team-20251210",
    [org?.currentOrg?.tier],
  );

  const pricingPlan = useMemo(
    () => (isPaidPlan ? paidPlan : freePlan),
    [isPaidPlan],
  );

  const handleStartTrial = async (selectedPlan?: EvalsPricingPlanName) => {
    if (!selectedPlan) {
      notification.setNotification("Please select a plan to continue", "error");
      return;
    }
    setSelectedPlan(selectedPlan);
    setIsConfirmDialogOpen(true);
  };

  const confirmEvalsChange = async () => {
    const success = await handleConfirmTrial(selectedPlan);
    if (success) setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <FeaturePreview
        title="LLM 评估套件"
        subtitle="用于性能优化"
        pricingPlans={pricingPlan}
        onStartTrial={handleStartTrial}
        isOnFreeTier={!isPaidPlan}
        featureSectionProps={{
          pageTitle: "部署前评估并监控生产",
          features: evalFeatures,
          quote: {
            prefix: '"The ability to evaluate prompts systematically',
            highlight: "increased our deployment confidence by 90%",
            suffix:
              'and helped us maintain consistent quality across all our AI features."',
          },
        }}
      />

      <TrialConfirmationDialog
        featureName={"Evals"}
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={confirmEvalsChange}
        isUpgrade={isPaidPlan}
      />
    </>
  );
};

export default EvalsPreview;
