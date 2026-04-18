import { Col } from "@/components/layout/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PlanFeatureCard } from "./PlanFeatureCard";

export const EnterprisePlanCard = () => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Card className="h-fit w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-end text-lg font-medium">
            Enterprise{" "}
            <span className="ml-2 rounded-md bg-purple-100 px-2 py-1 text-sm font-medium text-purple-700">
              Current plan
            </span>
          </CardTitle>
          <CardDescription>
            Your custom Enterprise plan tailored for your organization{"'"}s
            needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Col className="gap-4">
            <p className="text-sm text-muted-foreground">
              For detailed information about your Enterprise plan, including
              custom features, limits, and support options, please contact your
              account manager.
            </p>
            <Link href="mailto:enterprise-support@helicone.ai">
              <Button variant="outline">联系企业支持</Button>
            </Link>
          </Col>
        </CardContent>
      </Card>

      <div className="w-full flex flex-col gap-6 lg:w-[450px]">
        <PlanFeatureCard
          title="需要调整您的计划？"
          description="我们随时帮助您为不断变化的需求优化企业版计划。"
          buttonText="预约通话"
        />

        <PlanFeatureCard
          title="寻找文档？"
          description="访问我们全面的企业版文档和指南。"
          buttonText="查看企业版文档"
        />
      </div>
    </div>
  );
};
