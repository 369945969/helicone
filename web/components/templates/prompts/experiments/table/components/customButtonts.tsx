import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { 按钮 } from "../../../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../ui/dropdown-menu";
import { useState } from "react";
import { Check } from "lucide-react";
import { Switch } from "../../../../../ui/switch";
import { InfoBox } from "../../../../../ui/helicone/infoBox";
import ProviderKeySelector from "../providerKeySelector";

const ColumnsDropdown: React.FC<{
  wrapText: boolean;
  setWrapText: (wrap: boolean) => void;
  columnView: "all" | "inputs" | "outputs";
  setColumnView: (view: "all" | "inputs" | "outputs") => void;
}> = ({ wrapText, setWrapText, columnView, setColumnView }) => {
  const [combine输入Columns, setCombine输入Columns] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
按钮
          variant="outline"
          className="flex h-8 items-center justify-center space-x-1 border border-slate-200 px-2 py-0"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-700" />
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </按钮>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>列</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setColumnView("all");
            }}
          >
            {columnView === "all" && <Check className="mr-2 h-4 w-4" />}
            <span className="flex-1">显示全部</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setColumnView("inputs");
            }}
          >
            {columnView === "inputs" && <Check className="mr-2 h-4 w-4" />}
            <span className="flex-1">仅显示输入</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setColumnView("outputs");
            }}
          >
            {columnView === "outputs" && <Check className="mr-2 h-4 w-4" />}
            <span className="flex-1">仅显示输出</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>视图</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Switch
              checked={combine输入Columns}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={setCombine输入Columns}
              className="mr-2"
            />
            <span className="flex-1">合并输入列</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Switch
              checked={wrapText}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={setWrapText}
              className="mr-2"
            />
            <span className="flex-1">自动换行</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProviderKeyDropdown: React.FC<{
  providerKey: string | null;
  setProviderKey: (key: string) => void;
}> = ({ providerKey, setProviderKey }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
按钮
          variant="outline"
          className="flex h-8 items-center justify-center space-x-1 border border-slate-200 px-2 py-0"
        >
          <Cog6ToothIcon className="mr-2 h-4 w-4 text-slate-700" />
          {!providerKey && (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-700" />
          )}
        </按钮>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-w-[320px]"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        align="end"
      >
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Cog6ToothIcon className="mr-2 h-6 w-6" />
          <span className="text-base font-medium">设置</span>
        </DropdownMenuLabel>
        {!providerKey && (
          <InfoBox variant="warning" className="ml-2 p-2">
            <p className="flex gap-2 text-sm font-medium">
              <b>
                请选择一个提供商密钥来运行实验。您可以随时更改。
              </b>
            </p>
          </InfoBox>
        )}

        <div className="p-2">
          <ProviderKeySelector
            variant="basic"
            setProviderKeyCallback={(key) => {
              setProviderKey(key);
              // Don't close the dropdown
              // setOpen(false);
            }}
            defaultProviderKey={providerKey}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ColumnsDropdown, ProviderKeyDropdown };
