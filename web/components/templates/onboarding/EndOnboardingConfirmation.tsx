import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const EndOnboardingConfirmation = ({
  open,
  setOpen,
  onEnd,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onEnd: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[10002]">
        <DialogHeader>
          <DialogTitle>🏁 Ready to integrate with Helicone?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          别担心，您可以随时从侧边栏访问此组织。
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            算了
          </Button>
          <Button onClick={onEnd}>准备好了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndOnboardingConfirmation;
