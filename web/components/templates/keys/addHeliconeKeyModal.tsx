import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { clsx } from "../../shared/clsx";
import useNotification from "../../shared/notification/useNotification";
import ThemedModal from "../../shared/themed/themedModal";

interface AddHeliconeKeyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  apiKey: string;
}

const AddHeliconeKeyModal = (props: AddHeliconeKeyModalProps) => {
  const { open, setOpen, apiKey } = props;
  const { setNotification } = useNotification();

  return (
    <ThemedModal open={open} setOpen={setOpen}>
      <div className="flex w-[400px] flex-col space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          您的 Helicone 密钥
        </h1>
        <p className="text-sm text-gray-500">
          这将是您<b>唯一</b>一次可以查看您的 API 密钥。请
          将其保存在安全且可访问的地方。如果您丢失了 API 密钥，您
          将需要生成一个新的。
        </p>
        <div className="w-full space-y-1.5 text-sm">
          <div className="flex w-full flex-row items-center gap-4">
            <input
              type="text"
              name="proxy-key-name"
              id="proxy-key-name"
              className={clsx(
                "block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm",
              )}
              value={apiKey}
              disabled={true}
            />
            <button
              className="flex items-center rounded-md bg-black p-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                setNotification("已复制到剪贴板！", "success");
              }}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={() => setOpen(false)}
            type="button"
            className="flex flex-row items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </ThemedModal>
  );
};

export default AddHeliconeKeyModal;
