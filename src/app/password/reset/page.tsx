import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/account/reset-password-form";
import { ContentShell } from "@/components/content/content-shell";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Новый пароль",
    description: "Установка нового пароля личного кабинета MURU.",
    path: "/password/reset/",
    robots: { index: false, follow: false },
  });
}

export default function PasswordResetPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Новый пароль"
        breadcrumbs={contentBreadcrumbs({
          name: "Новый пароль",
          href: "/password/reset/",
        })}
      >
        <Suspense fallback={<p className="text-body text-text-muted">Загрузка…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </ContentShell>
    </main>
  );
}
