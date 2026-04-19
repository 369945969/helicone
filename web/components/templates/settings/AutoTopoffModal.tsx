import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Small, Muted, XSmall } from "@/components/ui/typography";
import { AlertCircle, CreditCard, Zap } from "lucide-react";
import {
  useAutoTopoffSettings,
  useUpdateAutoTopoffSettings,
  usePaymentMethods,
  useCreateSetupSession,
  useRemovePaymentMethod,
} from "../../../services/hooks/useAutoTopoff";

interface AutoTopoffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutoTopoffModal({ isOpen, onClose }: AutoTopoffModalProps) {
  const { data: settings, isLoading: settingsLoading } =
    useAutoTopoffSettings();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();
  const updateSettings = useUpdateAutoTopoffSettings();
  const createSetupSession = useCreateSetupSession();
  const removePaymentMethod = useRemovePaymentMethod();

  const [enabled, set已启用] = useState(settings?.enabled ?? false);
  const [threshold, setThreshold] = useState(
    settings?.thresholdCents
      ? (settings.thresholdCents / 100).toString()
      : "10",
  );
  const [topoffAmount, setTopoffAmount] = useState(
    settings?.topoffAmountCents
      ? (settings.topoffAmountCents / 100).toString()
      : "50",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    settings?.stripePaymentMethodId ?? "",
  );
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "alert",
  });

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      set已启用(settings.enabled);
      setThreshold(
        settings.thresholdCents
          ? (settings.thresholdCents / 100).toString()
          : "10",
      );
      setTopoffAmount(
        settings.topoffAmountCents
          ? (settings.topoffAmountCents / 100).toString()
          : "50",
      );
      setSelectedPaymentMethod(settings.stripePaymentMethodId ?? "");
    }
  }, [settings]);

  // Auto-select first payment method if available and none selected
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethods]); // Only run when paymentMethods changes, not when selectedPaymentMethod changes

  const handleSave = async () => {
    const thresholdCents = Math.round(parseFloat(threshold || "0") * 100);
    const topoffAmountCents = Math.round(parseFloat(topoffAmount || "0") * 100);

    if (!selectedPaymentMethod) {
      setAlertDialog({
        isOpen: true,
        title: "需要支付方式",
        description: "请选择支付方式",
        type: "alert",
      });
      return;
    }

    if (thresholdCents < 0) {
      setAlertDialog({
        isOpen: true,
        title: "无效的阈值",
        description: "阈值必须为非负数",
        type: "alert",
      });
      return;
    }

    if (topoffAmountCents < 500) {
      setAlertDialog({
        isOpen: true,
        title: "金额过低",
        description: "充值金额必须至少为 $5",
        type: "alert",
      });
      return;
    }

    if (topoffAmountCents > 1000000) {
      setAlertDialog({
        isOpen: true,
        title: "金额过高",
        description: "充值金额不得超过 $10,000",
        type: "alert",
      });
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

    onClose();
  };

  if (settingsLoading || paymentMethodsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Zap size={20} />
                自动充值设置
              </div>
            </DialogTitle>
          </DialogHeader>
          <Muted className="text-xs">正在加载...</Muted>
        </DialogContent>
      </Dialog>
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

  const handle移除PaymentMethod = async (paymentMethodId: string) => {
    // Check if it's the last payment method and auto top-off is enabled
    if (paymentMethods && paymentMethods.length === 1 && enabled) {
      setAlertDialog({
        isOpen: true,
        title: "无法移除支付方式",
        description:
          "在启用自动充值时无法移除最后一个支付方式。请先禁用自动充值。",
        type: "alert",
      });
      return;
    }

    setAlertDialog({
      isOpen: true,
      title: "移除支付方式",
      description: "确定要移除此支付方式吗？",
      type: "confirm",
      onConfirm: async () => {
        await removePaymentMethod.mutateAsync({
          params: { path: { paymentMethodId } },
        });
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Zap size={20} />
                自动充值设置
              </div>
            </DialogTitle>
            <DialogDescription>
              Automatically purchase credits when your balance falls below a
              threshold.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Auto Top-Up Toggle */}
            <div className="flex items-center justify-between">
              <Small className="font-semibold text-foreground">
                Auto Top-Up
              </Small>
              <div className="flex items-center gap-2">
                <Small className="text-muted-foreground">
                  {enabled ? "已启用" : "已禁用"}
                </Small>
                <Switch
                  checked={enabled}
                  onCheckedChange={set已启用}
                  disabled={!hasPaymentMethods}
                />
              </div>
            </div>
            {/* Payment Methods Management */}
            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="flex flex-col gap-2">
                {/* Payment Method Dropdown */}
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                >
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue placeholder="选择支付方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
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

                {/* 已保存的卡片 Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="saved-cards" className="border-none">
                    <AccordionTrigger className="w-fit justify-start py-0 pt-1 hover:no-underline">
                      <XSmall className="text-muted-foreground hover:text-foreground">
                        已保存的卡片
                      </XSmall>
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      <div className="flex flex-col gap-2">
                        {paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            className="flex items-center justify-between rounded-md border border-border bg-card p-2"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard
                                size={14}
                                className="text-muted-foreground"
                              />
                              <XSmall className="font-medium">
                                <span className="capitalize">{pm.brand}</span>{" "}
                                •••• {pm.last4}
                              </XSmall>
                            </div>
                            <Button
                              onClick={() => handle移除PaymentMethod(pm.id)}
                              disabled={removePaymentMethod.isPending}
                              variant="ghost"
                              size="sm"
                            >
                              移除
                            </Button>
                          </div>
                        ))}

                        {/* 添加卡片 Button */}
                        <Button
                          onClick={handleAddPaymentMethod}
                          disabled={createSetupSession.isPending}
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                        >
                          {createSetupSession.isPending
                            ? "加载中..."
                            : "添加卡片"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <Button
                onClick={handleAddPaymentMethod}
                disabled={createSetupSession.isPending}
                variant="outline"
                className="w-full"
              >
                {createSetupSession.isPending ? "加载中..." : "添加卡片"}
              </Button>
            )}

            {!hasPaymentMethods ? (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-muted p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 text-muted-foreground"
                  />

                  <div className="flex flex-col gap-1">
                    <XSmall className="font-medium">
                      未找到支付方式
                    </XSmall>
                    <XSmall className="text-muted-foreground">
                      Purchase credits first to save a payment method for auto
                      top-up.
                    </XSmall>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {settings?.consecutiveFailures !== undefined &&
                  settings.consecutiveFailures >= 2 && (
                    <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                      <AlertCircle
                        size={16}
                        className="mt-0.5 text-destructive"
                      />
                      <div className="flex flex-col gap-1">
                        <XSmall className="font-medium text-destructive">
                          检测到支付失败
                        </XSmall>
                        <XSmall className="text-destructive/80">
                          自动充值已失败 {settings.consecutiveFailures}{" "}
                          次。请检查您的支付方式。
                        </XSmall>
                      </div>
                    </div>
                  )}

                {enabled && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <Label
                          htmlFor="threshold"
                          className="whitespace-nowrap text-sm"
                        >
                          当余额低于:
                        </Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="threshold"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="10"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </div>
                      <XSmall className="text-muted-foreground">
                        处理可能需要长达 15 分钟。
                      </XSmall>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <Label
                          htmlFor="topoff-amount"
                          className="whitespace-nowrap text-sm"
                        >
                          购买金额:
                        </Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="topoff-amount"
                            type="number"
                            min="5"
                            max="10000"
                            step="1"
                            placeholder="50"
                            value={topoffAmount}
                            onChange={(e) => setTopoffAmount(e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </div>
                      <XSmall className="text-muted-foreground">
                        (最低 $5, 最高 $10,000)
                      </XSmall>
                    </div>

                    {/* Rate Limit Warning */}
                    <div className="flex items-start gap-2 rounded-md border border-border bg-muted p-3">
                      <AlertCircle
                        size={16}
                        className="mt-0.5 text-muted-foreground"
                      />
                      <XSmall className="text-muted-foreground">
                        For your protection, auto top-up is limited to once per
                        hour.
                      </XSmall>
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alertDialog.isOpen}
        onOpenChange={(open) =>
          !open && setAlertDialog({ ...alertDialog, isOpen: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertDialog.type === "confirm" && (
              <AlertDialogCancel>取消</AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={
                alertDialog.type === "confirm"
                  ? alertDialog.onConfirm
                  : undefined
              }
            >
              {alertDialog.type === "confirm" ? "移除" : "确定"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
