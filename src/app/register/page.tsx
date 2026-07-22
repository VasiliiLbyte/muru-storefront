import type { Metadata } from "next";

import { RegisterForm } from "@/components/account/register-form";
import { ContentShell } from "@/components/content/content-shell";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Регистрация",
    description: "Регистрация в личном кабинете MURU.",
    path: "/register/",
    robots: { index: false, follow: false },
  });
}

export default function RegisterPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Регистрация"
        breadcrumbs={contentBreadcrumbs({
          name: "Регистрация",
          href: "/register/",
        })}
      >
        <RegisterForm />
      </ContentShell>
    </main>
  );
}
