import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarkdownEditor from "@/components/shared/markdownEditor";
import clsx from "clsx";
import { useState, useEffect } from "react";
import useNotification from "@/components/shared/notification/useNotification";

interface ResponseFormatModalProps {
  responseFormat: any;
  onResponseFormatChange: (format: any) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const FORMAT_PLACEHOLDER = `{
  "name": "weather",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "城市或地点名称"
      },
      "temperature": {
        "type": "number",
        "description": "摄氏温度"
      },
      "conditions": {
        "type": "string",
        "description": "天气状况描述"
      }
    },
    "required": ["location", "temperature", "conditions"],
    "additionalProperties": false
  }
}`;

export default function ResponseFormatModal({
  open,
  setOpen,
  responseFormat,
  onResponseFormatChange,
}: ResponseFormatModalProps) {
  const [responseFormatText, setResponseFormatText] = useState("");
  const { setNotification } = useNotification();

  useEffect(() => {
    const newValue =
      typeof responseFormat === "string"
        ? responseFormat
        : JSON.stringify(responseFormat, null, 2);
    setResponseFormatText(newValue);
  }, [responseFormat]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          响应格式
        </Button>
      </DialogTrigger> */}
      <DialogContent
        className={clsx(
          "flex max-h-[600px] max-w-7xl flex-col overflow-y-auto",
        )}
      >
        <DialogHeader>
          <DialogTitle>响应格式</DialogTitle>
        </DialogHeader>
        <div className="max-h-[350px] min-h-[350px] overflow-y-auto border border-border">
          <MarkdownEditor
            placeholder={FORMAT_PLACEHOLDER}
            language="json"
            text={responseFormatText}
            setText={setResponseFormatText}
            className="min-h-[350px] w-full"
          />
        </div>
        <DialogFooter className="flex w-full justify-between">
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button
            onClick={() => {
              try {
                if (responseFormatText) {
                  const parsed = JSON.parse(responseFormatText || "{}");
                  onResponseFormatChange(parsed);
                } else {
                  onResponseFormatChange(undefined);
                }
                setOpen(false);
              } catch (e) {
                setNotification("无效的 JSON", "error");
              }
            }}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
