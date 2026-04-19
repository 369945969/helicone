import React, { useState } from "react";
import { CircleHelpIcon } from "lucide-react";
import { UpgradeProDialog } from "@/components/templates/organization/plan/upgradeProDialog";
import { FeatureName } from "@/hooks/useProFeature";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "./PricingCard";
import { FeaturePreviewSectionClean } from "@/components/templates/featurePreview/featurePreviewSectionClean";
import { RateLimitVisual } from "./RateLimitVisual";
import { DatasetVisual } from "./DatasetVisual";
import { SessionsFeatureVisual } from "./features/SessionsFeature";
import { CodeExample } from "./CodeExample";
import { useUpgradePlan } from "@/hooks/useUpgradePlan";
import {
  Feature,
  PreviewCard,
} from "@/components/templates/featurePreview/previewCard";
import { Button } from "@/components/ui/button";
import { H1, H2, P, Small } from "@/components/ui/typography";

export const FEATURED_SECTION_DESIGNS: Partial<Record<ProFeatureKey, Feature>> =
  {
    sessions: {
      variant: "preview-sections",
      title: "开始使用请求头跟踪",
      subtitle: "使用 3 个简单的请求头跟踪您的会话和追踪。",
      sections: [
        {
          title: "定义层次结构",
          description:
            "用于定义父子关系的简单路径语法。",
          docsLink: "https://docs.helicone.ai/features/sessions",
        },
        {
          title: "记录一切",
          description: "记录任何大语言模型、向量数据库和工具调用。",
          docsLink: "https://docs.helicone.ai/features/sessions",
        },
      ],
      media: {
        type: "component",
        component: SessionsFeatureVisual,
      },
      imageAlt: "Sessions and traces dashboard",
    },
    users: {
      variant: "bullets-cta",
      title: "",
      subtitles: [
        "Track per-user request volumes, costs, and usage patterns across your AI services.",
        "Gain detailed insights into individual user activity.",
        "Improve performance and detect potential abuse.",
      ],
      cta: {
        text: "View docs",
        link: "https://docs.helicone.ai/features/advanced-usage/user-metrics",
        variant: "outline",
      },
      media: {
        type: "image",
        src: "/static/featureUpgrade/user-metric.webp",
      },
      imageAlt: "User metrics dashboard",
    },
    datasets: {
      variant: "bullets-cta",
      title: "",
      subtitles: [
        "Curate datasets with your actual requests",
        "Fine-tune your LLMs to improve performance on specific tasks.",
        "Experiment with prompts to prevent regression.",
      ],
      media: {
        type: "component",
        component: DatasetVisual,
      },
      imageAlt: "Dataset curation interface",
      cta: {
        text: "View docs",
        link: "https://docs.helicone.ai/features/fine-tuning",
        variant: "outline",
      },
    },
    properties: {
      variant: "preview-sections",
      title: "",
      subtitle:
        "通过添加自定义元数据来增强您的请求分析，以跟踪业务指标、用户行为和应用程序特定的数据点，从而获得更深入的洞察",
      sections: [
        {
          title: "添加自定义元数据",
          description:
            "使用简单的请求头将自定义元数据添加到您的请求中。",
          docsLink:
            "https://docs.helicone.ai/features/advanced-usage/custom-properties",
        },
        {
          title: "分析元数据",
          description:
            "使用此元数据对您的数据进行细分并分析使用模式。",
          docsLink:
            "https://docs.helicone.ai/features/advanced-usage/custom-properties",
        },
      ],
      media: {
        type: "component",
        component: () => CodeExample("properties"),
      },
      imageAlt: "Properties dashboard",
    },
    cache: {
      variant: "bullets-cta",
      title: "",
      subtitles: [
        "Cut costs by minimizing the number of API calls.",
        "Faster response times for common queries and reduce the load on backend resources.",
        "Find the most common requests with your app and visualize on a dashboard.",
      ],
      media: {
        type: "image",
        src: "/static/featureUpgrade/caching.webp",
      },
      imageAlt: "Cache analytics dashboard",
      cta: {
        text: "View docs",
        link: "https://docs.helicone.ai/features/advanced-usage/caching",
        variant: "outline",
      },
    },
  };

export const PRO_FEATURES: Record<string, Feature> = {
  sessions: {
    variant: "bullets-cta",
    title: "跟踪会话和追踪",
    subtitles: [
      "使用 3 个简单的请求头跟踪您的会话和追踪",
      "使用简单的路径语法定义父子关系",
      "记录任何大语言模型、向量数据库和工具调用",
    ] as string[],
    media: {
      type: "image",
      src: "/static/featureUpgrade/sessions-small-grid.webp",
    },
    imageAlt: "会话和追踪仪表板",
    cta: {
      text: "查看文档",
      link: "https://docs.helicone.ai/features/sessions",
      variant: "outline",
    },
  },
  cache: {
    variant: "bullets-cta",
    title: "缓存常见响应",
    subtitles: [
      "通过最小化 API 调用次数来降低成本。",
      "为常见查询提供更快的响应时间，并减少后端资源的负载。",
      "查找应用程序中最常见的请求并在仪表板上可视化。",
    ] as string[],
    media: {
      type: "image",
      src: "/static/featureUpgrade/caching.webp",
    },
    imageAlt: "缓存分析仪表板",
    cta: {
      text: "查看文档",
      link: "https://docs.helicone.ai/features/advanced-usage/caching",
      variant: "outline",
    },
  },
  "rate-limits": {
    variant: "bullets-cta",
    title: "创建自定义速率限制",
    subtitles: [
      "为您的模型提供商设置自定义大语言模型速率限制。",
      "防止 API 滥用和过度流量，以维护所有用户的可用性。",
      "控制成本并防止意外过度使用。",
    ] as string[],
    media: {
      type: "component",
      component: RateLimitVisual,
    },
    imageAlt: "Rate limits configuration interface",
    cta: {
      text: "View docs",
      link: "https://docs.helicone.ai/features/advanced-usage/custom-rate-limits",
      variant: "outline",
    },
  },
  users: {
    variant: "bullets-cta",
    title: "跟踪用户指标",
    subtitles: [
      "跟踪您的 AI 服务中每个用户的请求量、成本和使用模式。",
      "深入了解个人用户活动。",
      "提高性能并检测潜在的滥用行为。",
    ] as string[],
    media: {
      type: "image",
      src: "/static/featureUpgrade/user-metric.webp",
    },
    imageAlt: "用户指标仪表板",
    cta: {
      text: "查看文档",
      link: "https://docs.helicone.ai/features/advanced-usage/user-metrics",
      variant: "outline",
    },
  },
  datasets: {
    variant: "bullets-cta",
    title: "策划高质量数据集",
    subtitles: [
      "使用您的实际请求策划数据集",
      "微调您的大语言模型以提高特定任务的性能。",
      "试验提示词以防止回归。",
    ] as string[],
    media: {
      type: "component",
      component: DatasetVisual,
    },
    imageAlt: "数据集策划界面",
    cta: {
      text: "查看文档",
      link: "https://docs.helicone.ai/features/fine-tuning",
      variant: "outline",
    },
  },
  webhooks: {
    variant: "bullets-cta",
    title: "使用 Webhooks 自动化您的工作流",
    subtitles: [
      "即时响应事件、触发操作并与外部工具集成。",
      "将数据从一个系统移动到另一个系统。",
      "基于自定义逻辑对请求进行评分。",
    ] as string[],
    media: {
      type: "component",
      component: () => CodeExample("webhook"),
    },
    imageAlt: "Webhook 代码示例",
    cta: {
      text: "查看文档",
      link: "https://docs.helicone.ai/features/webhooks",
      variant: "outline",
    },
  },
  alerts: {
    variant: "bullets",
    title: "设置实时警报",
    subtitles: [
      "在 Slack 或电子邮件中接收实时警报。",
      "Stay on top of critical issues and resolve them faster.",
    ] as string[],
    media: {
      type: "image",
      src: "/static/featureUpgrade/alerts.webp",
    },
    imageAlt: "Alert notification interface",
  },
} as const satisfies Record<string, Feature>;

export type ProFeatureKey = keyof typeof PRO_FEATURES;

interface FeatureUpgradeCardProps {
  title: string;
  featureName?: FeatureName;
  featureImage?: {
    type: "image" | "component";
    content: string | React.ComponentType; // string for image URL, component for React component
  };
  headerTagline?: string;
  icon?: React.ReactNode;
  highlightedFeature?: ProFeatureKey;
}

export const FeatureUpgradeCard: React.FC<FeatureUpgradeCardProps> = ({
  title,
  featureName,
  featureImage,
  headerTagline,
  icon,
  highlightedFeature,
}) => {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { handleUpgradeTeam, isLoading } = useUpgradePlan();

  const getFeatures = () => {
    let features = { ...PRO_FEATURES };

    // Remove the highlighted feature from the general section
    if (highlightedFeature && features[highlightedFeature]) {
      const { [highlightedFeature]: _, ...remainingFeatures } = features;
      features = remainingFeatures;
    }

    return features;
  };

  const pricingCards = (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <PricingCard title="业余版" price="免费" isCurrentPlan={true} />
      <PricingCard
        title="专业版"
        price="$20"
        priceSubtext="/座位/月"
        isPopular={true}
        variant="highlighted"
        onClick={() => setIsUpgradeDialogOpen(true)}
      />
      <PricingCard
        title="团队版"
        price="$200"
        priceSubtext="/月"
        isBestValue={true}
        variant="outlined"
        onClick={handleUpgradeTeam}
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 bg-[hsl(var(--background))] px-4 py-10 md:px-24">
      {/* Header Section */}
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col justify-between md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center">
              {icon || (
                <CircleHelpIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              )}
            </div>
            <Small className="text-[hsl(var(--muted-foreground))]">
              {title}
            </Small>
          </div>
          <div className="flex flex-row">
            <div className="inline-flex h-full items-center justify-center gap-2.5">
              <P className="text-[hsl(var(--muted-foreground))]">包含于</P>
              <Badge
                className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                variant="helicone"
              >
                Pro and above
              </Badge>
            </div>
          </div>
        </div>

        <H1>{headerTagline}</H1>

        {pricingCards}
      </div>

      {featureImage && (
        <div className="w-full">
          {featureImage.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featureImage.content as string}
              alt="Feature preview"
              className="h-auto w-full"
            />
          ) : (
            <div className="w-full">
              {React.createElement(featureImage.content as React.ComponentType)}
            </div>
          )}
        </div>
      )}

      {highlightedFeature && (
        <PreviewCard
          feature={
            FEATURED_SECTION_DESIGNS[highlightedFeature] ??
            PRO_FEATURES[highlightedFeature]
          }
          position="left"
          isHighlighted={true}
        />
      )}

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <H2>其他所有功能</H2>
          <div className="inline-flex -translate-y-1 rotate-2 items-center rounded-xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] px-[18px] py-2">
            <div className="text-[hsl(var(--primary))]">Pro</div>
          </div>
        </div>

        <Button
          onClick={() => setIsUpgradeDialogOpen(true)}
          className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[hsl(var(--primary))] px-6 py-1.5"
        >
          <div className="text-[hsl(var(--primary-foreground))]">
            Start 7-day free trial
          </div>
        </Button>
      </div>

      <FeaturePreviewSectionClean features={getFeatures()} />

      <UpgradeProDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        featureName={featureName}
      />
    </div>
  );
};
