import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/account/login-form";
import { ContentShell } from "@/components/content/content-shell";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Вход",
    description: "Вход в личный кабинет MURU.",
    path: "/login/",
    robots: { index: false, follow: false },
  });
}

export default function LoginPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Вход"
        breadcrumbs={contentBreadcrumbs({ name: "Вход", href: "/login/" })}
      >
        <Suspense fallback={<p className="text-body text-text-muted">Загрузка…</p>}>
          <LoginForm variant="page" />
        </Suspense>
      </ContentShell>
    </main>
  );
}
