import { useOrg } from "@/components/layout/org/organizationContext";
import useNotification from "@/components/shared/notification/useNotification";
import { TrialConfirmationDialog } from "@/components/shared/TrialConfirmationDialog";
import { useFeatureTrial } from "@/hooks/useFeatureTrial";
import { useMemo, useState } from "react";
import FeaturePreview, { PricingPlan } from "../featurePreview/featurePreview";
import { Feature } from "../featurePreview/featurePreviewSection";

type PromptPricingPlanName = "Prompt" | "Pro + Prompt" | "Team Bundle";

const promptFeatures: Feature[] = [
  {
    title: "构建和部署\n生产就绪的提示词",
    description: [
      "在 UI 中协作设计提示词或直接在代码中管理",
      "创建带有变量的模板并跟踪真实的生产输入",
      "连接到任何主要的 AI 提供商（Anthropic、OpenAI、Google、Meta、DeepSeek 等）",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/prompts1_2.mp4",
      fallbackImage: "/static /features/prompts/feature1.png",
    },
    imageAlt: "提示词构建界面",
    isImageLeft: true,
    ctaText: "开始构建",
  },
  {
    title: "控制提示词的每个版本",
    description: [
      "在代码中自动跟踪版本或在 UI 中手动跟踪",
      "即时切换、升级或回滚版本",
      "跟踪提交消息以了解为什么进行更改",
      "仅使用提示词 ID 部署任何版本",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/prompts2_2.mp4",
      fallbackImage: "/static/features/prompts/feature2.png",
    },
    imageAlt: "版本控制界面",
    ctaText: "立即部署",
  },
  {
    title: "提示词编辑器 Copilot",
    description: [
      "使用自动完成和智能建议更快地编写提示词",
      "使用快捷方式添加变量 (⌘E) 和 XML 分隔符 (⌘J)",
      "使用自然语言 (⌘K) 执行您描述的任何编辑",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/prompts3_2.mp4",
      fallbackImage: "/static/features/prompts/feature3.png",
    },
    imageAlt: "提示词测试界面",
    isImageLeft: true,
    ctaText: "开始编辑",
  },
  {
    title: "实时测试提示词",
    description: [
      "并排编辑和运行提示词并获得即时反馈",
      "使用不同的模型、消息、温度和参数进行实验",
    ],
    media: {
      type: "video",
      src: "https://marketing-assets-helicone.s3.us-west-2.amazonaws.com/prompts4_2.mp4",
      fallbackImage: "/static/features/prompts/feature4.png",
    },
    imageAlt: "提示词测试界面",
    isImageLeft: false,
    ctaText: "测试提示词",
  },
];

const freePlan: PricingPlan<PromptPricingPlanName>[] = [
  {
    name: "Pro + Prompt",
    price: "50",
    isSelected: true,
    priceSubtext: "+$20/seat",
    features: [
      { name: "+ $20/seat", included: true },
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

const paidPlan: PricingPlan<PromptPricingPlanName>[] = [
  {
    name: "Prompt",
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

const PromptsPreview = () => {
  const org = useOrg();
  const notification = useNotification();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { handleConfirmTrial, proRequired } = useFeatureTrial(
    "prompts",
    "Prompts",
  );
  const [selectedPlan, setSelectedPlan] = useState<PromptPricingPlanName>();

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

  const handleStartTrial = async (selectedPlan?: PromptPricingPlanName) => {
    if (!selectedPlan) {
      notification.setNotification("Please select a plan to continue", "error");
      return;
    }
    setSelectedPlan(selectedPlan);
    setIsConfirmDialogOpen(true);
  };

  const confirmPromptsChange = async () => {
    const success = await handleConfirmTrial(selectedPlan);
    if (success) setIsConfirmDialogOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <FeaturePreview
        title="提示词管理"
        subtitle="在共享工作空间中"
        pricingPlans={pricingPlan}
        onStartTrial={handleStartTrial}
        featureSectionProps={{
          pageTitle: "Create, Version and Test Prompts Collaboratively",
          features: promptFeatures,
          quote: {
            prefix:
              '"The ability to test prompt variations on production traffic without touching a line of code is magical.',
            highlight: "It feels like we're cheating; it's just that good!\"",
            suffix: "",
          },
        }}
        isOnFreeTier={!isPaidPlan}
      />
      <TrialConfirmationDialog
        featureName="Prompts"
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={confirmPromptsChange}
        isUpgrade={isPaidPlan}
      />
    </div>
  );
};

export default PromptsPreview;
