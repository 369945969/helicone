import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Small, Muted, XSmall } from "@/components/ui/typography";
import { AlertCircle, CheckCircle, CreditCard, Zap } from "lucide-react";
import {
  useAutoTopoffSettings,
  useUpdateAutoTopoffSettings,
  usePaymentMethods,
  useCreateSetupSession,
  useRemovePaymentMethod,
} from "../../../services/hooks/useAutoTopoff";

export function AutoTopoffSettings() {
  const { data: settings, isLoading: settingsLoading } =
    useAutoTopoffSettings();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();
  const updateSettings = useUpdateAutoTopoffSettings();
  const createSetupSession = useCreateSetupSession();
  const removePaymentMethod = useRemovePaymentMethod();

  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [threshold, setThreshold] = useState(
    settings?.thresholdCents ? (settings.thresholdCents / 100).toString() : "",
  );
  const [topoffAmount, setTopoffAmount] = useState(
    settings?.topoffAmountCents
      ? (settings.topoffAmountCents / 100).toString()
      : "",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    settings?.stripePaymentMethodId ?? "",
  );

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setThreshold((settings.thresholdCents / 100).toString());
      setTopoffAmount((settings.topoffAmountCents / 100).toString());
      setSelectedPaymentMethod(settings.stripePaymentMethodId ?? "");
    }
  }, [settings]);

  const handleSave = async () => {
    const thresholdCents = Math.round(parseFloat(threshold || "0") * 100);
    const topoffAmountCents = Math.round(parseFloat(topoffAmount || "0") * 100);

    if (!selectedPaymentMethod) {
      alert("请选择支付方式");
      return;
    }

    if (thresholdCents < 0) {
      alert("阈值必须为非负数");
      return;
    }

    if (topoffAmountCents < 500) {
      alert("充值金额必须至少为 $5");
      return;
    }

    if (topoffAmountCents > 1000000) {
      alert("充值金额不能超过 $10,000");
      return;
    }

    await updateSettings.mutateAsync({
      body: {
        enabled,
        thresholdCents,
        topoffAmountCents,
        stripePaymentMethodId: selectedPaymentMethod,
      },
    });
  };

  if (settingsLoading || paymentMethodsLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Small className="font-semibold">Auto Top-Up</Small>
        <Muted className="text-xs">正在加载...</Muted>
      </div>
    );
  }

  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;

  const handleAddPaymentMethod = async () => {
    await createSetupSession.mutateAsync({
      body: {
        returnUrl: "/credits",
      },
    });
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (
      confirm(
        "确定要移除此支付方式吗？如果这是唯一的支付方式，自动充值将被禁用。",
      )
    ) {
      await removePaymentMethod.mutateAsync({
        params: { path: { paymentMethodId } },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-muted-foreground" />
          <CardTitle className="text-base">自动充值</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Payment Methods Management */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Small className="font-semibold text-foreground">
              支付方式
            </Small>
            <Button
              onClick={handleAddPaymentMethod}
              disabled={createSetupSession.isPending}
              variant="outline"
              size="sm"
            >
              {createSetupSession.isPending ? "加载中..." : "添加卡片"}
            </Button>
          </div>

          {paymentMethods && paymentMethods.length > 0 ? (
            <div className="flex flex-col gap-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-muted-foreground" />
                    <div className="flex flex-col">
                      <XSmall className="font-medium">
                        <span className="capitalize">{pm.brand}</span> ••••{" "}
                        {pm.last4}
                      </XSmall>
                      <XSmall className="text-muted-foreground">
                        有效期至 {pm.exp_month}/{pm.exp_year}
                      </XSmall>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemovePaymentMethod(pm.id)}
                    disabled={removePaymentMethod.isPending}
                    variant="ghost"
                    size="sm"
                  >
                    移除
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Muted className="text-xs">未保存支付方式</Muted>
          )}
        </div>

        {/* Auto Top-Up Toggle */}
        <div className="flex items-center justify-between">
          <Small className="font-semibold text-slate-900 dark:text-slate-100">
            自动充值
          </Small>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={!hasPaymentMethods}
          />
        </div>

        {!hasPaymentMethods ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-muted p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <XSmall className="font-medium">未找到支付方式</XSmall>
                <XSmall className="text-muted-foreground">
                  Purchase credits first to save a payment method for auto
                  top-up.
                </XSmall>
              </div>
            </div>
          </div>
        ) : (
          <>\n            <Muted className="text-xs">
              当余额低于阈值时自动购买积分。
            </Muted>

            {settings?.consecutiveFailures &&
              settings.consecutiveFailures >= 2 && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <AlertCircle size={16} className="mt-0.5 text-destructive" />
                  <div className="flex flex-col gap-1">
                    <XSmall className="font-medium text-destructive">
                      检测到支付失败
                    </XSmall>
                    <XSmall className="text-destructive/80">
                      自动充值已失败 {settings.consecutiveFailures} 次。请检查您的支付方式。
                    </XSmall>
                  </div>
                </div>
              )}

            {enabled && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="threshold" className="text-xs">
                    余额阈值 (美元)
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="10"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full"
                  />
                  <XSmall className="text-muted-foreground">
                    当余额低于此金额时触发自动充值。处理可能需要长达 15 分钟。
                  </XSmall>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="topoff-amount" className="text-xs">
                    充值金额 (美元)
                  </Label>
                  <Input
                    id="topoff-amount"
                    type="number"
                    min="5"
                    max="10000"
                    step="1"
                    placeholder="50"
                    value={topoffAmount}
                    onChange={(e) => setTopoffAmount(e.target.value)}
                    className="w-full"
                  />
                  <XSmall className="text-muted-foreground">
                    购买金额 (最低 $5, 最高 $10,000)
                  </XSmall>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="payment-method" className="text-xs">
                    支付方式
                  </Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger id="payment-method" className="w-full">
                      <SelectValue placeholder="选择支付方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods?.map((pm) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} />
                            <span className="capitalize">{pm.brand}</span>
                            <span>•••• {pm.last4}</span>
                            <span className="text-xs text-muted-foreground">
                              {pm.exp_month}/{pm.exp_year}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateSettings.isPending}
                  className="w-full"
                >
                  {updateSettings.isPending ? "保存中..." : "保存设置"}
                </Button>
              </div>
            )}

            {!enabled && (
              <Button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                variant="outline"
                className="w-full"
              >
                保存设置
              </Button>
            )}

            {settings?.lastTopoffAt && (
              <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
                <CheckCircle size={16} className="mt-0.5 text-green-600" />
                <div className="flex flex-col gap-1">
                  <XSmall className="font-medium">上次充值</XSmall>
                  <XSmall className="text-muted-foreground">
                    {new Date(settings.lastTopoffAt).toLocaleString()}
                  </XSmall>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
