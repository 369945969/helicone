import FeaturePreview, { PricingPlan } from "../featurePreview/featurePreview";
import { Feature } from "../featurePreview/featurePreviewSection";
import useNotification from "@/components/shared/notification/useNotification";
import { useMemo, useState } from "react";
import { useFeatureTrial } from "@/hooks/useFeatureTrial";
import { TrialConfirmationDialog } from "@/components/shared/TrialConfirmationDialog";
import { useOrg } from "@/components/layout/org/organizationContext";
import Experiment from "./experiment";

type ExperimentPricingPlanName =
  | "Experiments"
  | "Pro + Experiments"
  | "Team Bundle";

const experimentFeatures: Feature[] = [
  {
    title: "为生产环境调优您的 LLM 提示词",
    description: [
      "并排测试不同的提示词、模型和参数以找到最佳组合",
      "从任何来源开始实验 - 从零开始的提示词、现有请求或模板",
      "连接任何主要 AI 提供商 (Anthropic、OpenAI、Google、Meta、DeepSeek 等)",
    ],
    media: {
      type: "component",
      component: () => <Experiment />,
    },
    imageAlt: "Experiment interface showing multiple prompts",
    isImageLeft: true,
    ctaText: "开始实验",
  },
  {
    title: "使用历史和真实世界数据测试提示词",
    description: [
      "使用真实生产数据识别和优化边缘情况",
      "在推送到生产环境之前调整提示词",
      "针对历史请求验证更改",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/experiments_last.mp4",
      fallbackImage: "/static/features/experiments/feature3.png",
    },
    imageAlt: "Historical data testing interface",
    isImageLeft: false,
    ctaText: "使用真实世界数据测试",
  },
  {
    title: "使用离线测试评估响应",
    description: [
      "使用 LLM-as-judge 或 Python 评估器量化响应质量",
      "将评估器附加到实验以跟踪跨迭代和模型版本的性能",
      "使用评分响应的热力图可视化优化边缘情况",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/evals_experiments.mp4",
      fallbackImage: "/static/features/experiments/feature2.png",
    },
    imageAlt: "Evaluation interface showing heatmap of scored responses",
    isImageLeft: true,
    ctaText: "Enable evals",
    ctaLink: "/evaluators",
  },
];

const freePlan: PricingPlan<ExperimentPricingPlanName>[] = [
  {
    name: "Pro + Experiments",
    price: "50",
    isSelected: true,
    priceSubtext: "+$20/seat",
    features: [
      { name: "$20/seat", included: true },
      { name: "Experiments", included: true },
      { name: "Prompts (+$50/mo)", included: false },
      { name: "Evals (+$100/mo)", included: false },
    ],
  },
  {
    name: "Team Bundle",
    price: "200",
    features: [
      { name: "Unlimited seats", included: true },
      { name: "Experiments", included: true },
      { name: "Prompts", included: true },
      { name: "Evals", included: true },
    ],
  },
];

const paidPlan: PricingPlan<ExperimentPricingPlanName>[] = [
  {
    name: "Experiments",
    price: "50",
    isSelected: true,
    features: [
      { name: "Pro seats (current plan)", included: true },
      { name: "Prompts", included: true },
      {
        name: "Experiments",
        included: false,
        additionalCost: "+$50/mo",
      },
      { name: "Evals", included: false, additionalCost: "+$100/mo" },
    ],
  },
  {
    name: "Team Bundle",
    price: "200",
    features: [
      { name: "Unlimited seats", included: true },
      { name: "Prompts", included: true },
      { name: "Experiments", included: true },
      { name: "Evals", included: true },
    ],
  },
];

const ExperimentsPreview = () => {
  const org = useOrg();
  const notification = useNotification();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { handleConfirmTrial } = useFeatureTrial("experiments", "Experiments");
  const [selectedPlan, setSelectedPlan] = useState<ExperimentPricingPlanName>();

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

  const handleStartTrial = async (selectedPlan?: ExperimentPricingPlanName) => {
    if (!selectedPlan) {
      notification.setNotification("Please select a plan to continue", "error");
      return;
    }
    setSelectedPlan(selectedPlan);
    setIsConfirmDialogOpen(true);
  };

  const confirmExperimentsChange = async () => {
    const success = await handleConfirmTrial(selectedPlan);
    if (success) setIsConfirmDialogOpen(false);
  };

  if (!org?.currentOrg) {
    return null;
  }

  // Check if user requires upgrade for experiments feature

  return (
    <>
      <FeaturePreview
        title="提示词实验"
        subtitle="在类似电子表格的环境中"
        pricingPlans={pricingPlan}
        onStartTrial={handleStartTrial}
        isOnFreeTier={!isPaidPlan}
        featureSectionProps={{
          pageTitle: "大规模调优和测试提示词",
          features: experimentFeatures,
          quote: {
            prefix:
              '"Being able to experiment with different prompts and models',
            highlight: "cut our optimization time in half",
            suffix:
              'and helped us find the perfect balance of cost and performance."',
          },
        }}
      />
      <TrialConfirmationDialog
        featureName="Experiments"
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={confirmExperimentsChange}
        isUpgrade={isPaidPlan}
      />
    </>
  );
};

export default ExperimentsPreview;
