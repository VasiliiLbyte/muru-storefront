import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { REFRESH_COOKIE_NAME } from "@/lib/account/bff-config";

/** Legacy stub → login or account depending on refresh cookie. */
export default async function PersonalPage() {
  const jar = await cookies();
  const hasSession = Boolean(jar.get(REFRESH_COOKIE_NAME)?.value);
  redirect(hasSession ? "/account/" : "/login/");
}
