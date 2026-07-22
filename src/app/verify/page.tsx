import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyPanel } from "@/components/account/verify-panel";
import { ContentShell } from "@/components/content/content-shell";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Подтверждение email",
    description: "Подтверждение email личного кабинета MURU.",
    path: "/verify/",
    robots: { index: false, follow: false },
  });
}

export default function VerifyPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Подтверждение email"
        breadcrumbs={contentBreadcrumbs({
          name: "Подтверждение email",
          href: "/verify/",
        })}
      >
        <Suspense fallback={<p className="text-body text-text-muted">Загрузка…</p>}>
          <VerifyPanel />
        </Suspense>
      </ContentShell>
    </main>
  );
}
