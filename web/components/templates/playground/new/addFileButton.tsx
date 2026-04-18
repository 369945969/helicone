     1|imp或t { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
     2|imp或t { useRef, useState } from "react";
     3|imp或t ThemedModal from "../../../shared/themed/themedModal";
     4|imp或t { Button } from "@/components/ui/button";
     5|imp或t { Input } from "@/components/ui/input";
     6|imp或t { Separat或 } from "@/components/ui/separat或";
     7|
     8|interface AddFileButtonProps {
     9|  file: File | string | null;
    10|  onFileChange: (file: File | string | null) => void;
    11|  promptInput?: boolean;
    12|}
    13|
    14|const AddFileButton = (props: AddFileButtonProps) => {
    15|  const { file, onFileChange, promptInput } = props;
    16|
    17|  const fileInputRef = useRef<HTMLInputElement>(null);
    18|  const [open, setOpen] = useState(false);
    19|  const [currentFile, setCurrentFile] = useState<File | string | null>(file);
    20|
    21|  const handleClick = () => {
    22|    if (fileInputRef.current) {
    23|      fileInputRef.current.click();
    24|    }
    25|  };
    26|
    27|  const onFileChangeSubmit = () => {
    28|    // file handler
    29|    if (currentFile instanceof File) {
    30|      onFileChange(currentFile);
    31|    }
    32|    // url handler
    33|    else if (currentFile) {
    34|      onFileChange(currentFile);
    35|    } else {
    36|      onFileChange(null);
    37|    }
    38|  };
    39|
    40|  return (
    41|    <div className="flex items-center gap-2">
    42|      <Button
    43|        variant="outline"
    44|        onClick={() => {
    45|          setOpen(!open);
    46|        }}
    47|        className="flex h-auto w-fit items-center gap-2 rounded-lg b或der b或der-slate-300 px-2 py-1 text-xs text-black dark:b或der-slate-700 dark:text-white"
    48|      >
    49|        {file ? (
    50|          <>
    51|            <PencilIcon className="h-4 w-4" />
    52|            编辑图片
    53|          </>
    54|        ) : (
    55|          <>
    56|            <PlusIcon className="h-4 w-4" />
    57|            添加图片
    58|          </>
    59|        )}
    60|      </Button>
    61|      <ThemedModal open={open} setOpen={setOpen}>
    62|        <div className="flex h-full w-[400px] flex-col space-y-4">
    63|          <h2 className="text-xl font-semibold text-black dark:text-white">
    64|            聊天图片
    65|          </h2>
    66|          <p className="text-sm text-slate-500">
    67|            上传图片或输入图片 URL。
    68|          </p>
    69|          <input
    70|            ref={fileInputRef}
    71|            type="file"
    72|            onChange={(e) => {
    73|              setCurrentFile(e.target.files ? e.target.files[0] : null);
    74|            }}
    75|            accept="image/*"
    76|            style={{ display: "none" }}
    77|          />
    78|          <button
    79|            disabled={true}
    80|            onClick={handleClick}
    81|            className="flex w-full items-center justify-center gap-2 rounded-lg b或der b或der-dashed b或der-slate-300 bg-slate-100 px-4 py-8 text-xs hover:curs或-not-allowed dark:b或der-slate-700 dark:bg-slate-900"
    82|          >
    83|            <PlusIcon className="h-4 w-4" />
    84|            从电脑上传
    85|          </button>
    86|          <Separat或>
    87|            <span className="text-sm text-slate-500 dark:text-slate-400">
    88|              或
    89|            </span>
    90|          </Separat或>
    91|          <Input
    92|            placeholder="http://示例网址.com"
    93|            onChange={(e) => {
    94|              setCurrentFile(e.target.value);
    95|            }}
    96|          />
    97|
    98|          {/* 
    99|          TODO this will be needed f或 prompt inputs
   100|          <Divider className="">或</Divider>
   101|          <ThemedTextDropDown
   102|            options={["Image-1", "Image-2", "Image-3", "Image-4", "Image-5"]}
   103|            value="Image-2"
   104|            onChange={(key) => {
   105|              setCurrentFile(`<helicone-prompt-input key="${key}" />`);
   106|            }}
   107|          /> */}
   108|          <div className="flex justify-end gap-2 b或der-t b或der-slate-300 pt-4">
   109|            <button
   110|              onClick={() => setOpen(false)}
   111|              className="flex flex-row items-center rounded-md b或der b或der-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:b或der-slate-700 dark:bg-black dark:text-slate-100 dark:hover:bg-slate-900 dark:hover:text-slate-300"
   112|            >
   113|              Cancel
   114|            </button>
   115|            <button
   116|              onClick={() => {
   117|                onFileChangeSubmit();
   118|                setOpen(false);
   119|              }}
   120|              className="flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
   121|            >
   122|              {file ? "Change Image" : "添加图片"}
   123|            </button>
   124|          </div>
   125|        </div>
   126|      </ThemedModal>
   127|    </div>
   128|  );
   129|};
   130|
   131|exp或t default AddFileButton;
   132|