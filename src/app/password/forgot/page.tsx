import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/account/forgot-password-form";
import { ContentShell } from "@/components/content/content-shell";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Восстановление пароля",
    description: "Восстановление пароля личного кабинета MURU.",
    path: "/password/forgot/",
    robots: { index: false, follow: false },
  });
}

export default function PasswordForgotPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Восстановление пароля"
        breadcrumbs={contentBreadcrumbs({
          name: "Восстановление пароля",
          href: "/password/forgot/",
        })}
      >
        <ForgotPasswordForm />
      </ContentShell>
    </main>
  );
}
