import useNotification from "@/components/shared/notification/useNotification";
import { useJawnClient } from "@/lib/clients/jawnHook";
import { useMutation } from "@tanstack/react-query";

export const useExperiment = () => {
  const jawnClient = useJawnClient();
  const { setNotification } = useNotification();

  const newFromPromptVersion = useMutation({
    mutationFn: async ({
      name,
      originalPromptVersion,
    }: {
      name: string;
      originalPromptVersion: string;
    }) => {
      return await jawnClient.POST("/v2/experiment/new", {
        body: {
          name,
          originalPromptVersion,
        },
      });
    },
    onSuccess: () => {
      setNotification("成功创建新实验", "success");
    },
    onError: () => {
      setNotification("创建新实验失败", "error");
    },
  });

  return {
    newFromPromptVersion,
  };
};
