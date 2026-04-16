import Cookies from "js-cookie";
import { Result, err } from "@/packages/common/result";
import { BETTER_AUTH_AUTH_TOKEN } from "./constants";

export function getHeliconeCookie(): Result<
  {
    jwtToken: string;
  },
  string
> {
  const authFromCookie = Cookies.get(BETTER_AUTH_AUTH_TOKEN);

  if (!authFromCookie) {
    return err("No auth token found in cookie");
  }
  // Better Auth stores the token directly, not as a JSON array
  const jwtToken = authFromCookie;
  return {
    data: {
      jwtToken,
    },
    error: null,
  };
}
