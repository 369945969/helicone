import { useRouter } from "next/router";
import useNotification from "../components/shared/notification/useNotification";
import AuthForm from "../components/templates/auth/authForm";
import { useHeliconeAuthClient } from "@/packages/common/auth/client/AuthClientFactory";
import { logger } from "@/lib/telemetry/logger";
const ResetPassword = () => {
  const router = useRouter();
  const heliconeAuthClient = useHeliconeAuthClient();
  const { setNotification } = useNotification();

  return (
    <AuthForm
      handleEmailSubmit={async (email: string, password: string) => {
        const { error } = await heliconeAuthClient.updateUser({
          password: password,
        });

        if (error) {
          setNotification("更新用户时出错。请重试。", "error");
          logger.error({ error }, "Error updating user");
          return;
        }
        setNotification("成功。正在重定向...", "success");
        router.push("/dashboard");
      }}
      authFormType={"reset-password"}
    />
  );
};

export default ResetPassword;
