import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { StaticProse } from "@/components/content/static-prose";
import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";
import type { VacancySections } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

const RESUME_BTN_CLASS =
  "h-[38px] self-start rounded-none px-4 text-[15px] font-medium hover:bg-[#52602F]";

function ResumeMailtoButton({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const trimmed = email.trim();
  if (!trimmed) return null;

  return (
    <Button
      render={<Link href={`mailto:${trimmed}`} />}
      size="sm"
      className={cn(RESUME_BTN_CLASS, className)}
    >
      Отправить резюме
    </Button>
  );
}

function VacancyHero({
  hero,
  breadcrumbs,
}: {
  hero: NonNullable<VacancySections["hero"]>;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <section className="relative w-full bg-surface">
      <div className="relative w-full">
        {hero.image?.url ? (
          <Image
            src={hero.image.url}
            alt={hero.image.alt ?? ""}
            width={hero.image.width ?? 1920}
            height={hero.image.height ?? 1080}
            priority
            sizes="100vw"
            className="h-auto w-full object-contain"
            {...staticBlurProps()}
          />
        ) : (
          <div className="aspect-video w-full bg-surface" aria-hidden />
        )}
        <div className="absolute top-0 left-0 z-10 w-full max-w-[1564px] px-4 pt-8 sm:px-8 [&_ol]:text-white [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-[75px] flex w-full max-w-[700px] flex-col gap-4 bg-background px-[70px] py-10 text-center max-sm:mx-4 max-sm:max-w-none max-sm:px-8 max-sm:py-8">
        <h1 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2] font-normal tracking-[0.08em] text-text-heading uppercase">
          {hero.heading}
        </h1>
      </div>
    </section>
  );
}

function VacancyHrBlock({
  hr,
}: {
  hr: VacancySections["hr"];
}) {
  const phone = hr.phone.trim();
  const email = hr.email.trim();
  const name = hr.contactName.trim();

  return (
    <section className="flex flex-col gap-6 border-y border-black/30 py-8">
      {hr.heading ? (
        <h2 className="font-display text-h3 text-text-heading">{hr.heading}</h2>
      ) : null}
      <dl className="flex flex-col gap-6">
        {name ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="text-small text-text-muted sm:min-w-[160px]">
              Контактное лицо
            </dt>
            <dd className="text-body text-text-heading">{name}</dd>
          </div>
        ) : null}
        {phone ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="text-small text-text-muted sm:min-w-[160px]">
              Телефон
            </dt>
            <dd>
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="text-body text-text-heading transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                {phone}
              </a>
            </dd>
          </div>
        ) : null}
        {email ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="text-small text-text-muted sm:min-w-[160px]">
              E-mail
            </dt>
            <dd>
              <a
                href={`mailto:${email}`}
                className="text-body text-text-heading transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                {email}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <ResumeMailtoButton email={hr.email} />
    </section>
  );
}

function VacancyMetaRow({
  city,
  experience,
  format,
  salary,
}: {
  city: string;
  experience: string;
  format: string;
  salary: string;
}) {
  const cells = [
    { key: "city", value: city },
    { key: "experience", value: experience },
    { key: "format", value: format },
    { key: "salary", value: salary },
  ].filter((c) => c.value.trim());

  if (cells.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 text-small text-text-secondary">
      {cells.map((cell) => (
        <span key={cell.key}>{cell.value.trim()}</span>
      ))}
    </div>
  );
}

function VacancyList({
  vacancies,
  resumeEmail,
}: {
  vacancies: VacancySections["vacancies"];
  resumeEmail: string;
}) {
  return (
    <section className="flex flex-col gap-6">
      {vacancies.heading ? (
        <h2 className="font-display text-h3 text-text-heading">
          {vacancies.heading}
        </h2>
      ) : null}
      <ul className="flex flex-col gap-6">
        {vacancies.items.map((item) => (
          <li key={item.id}>
            <details
              className={cn(
                "group border border-black/30 rounded-none transition-colors",
                "hover:border-brand-hover open:border-brand",
              )}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-8 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <span className="text-body font-medium text-text-heading">
                    {item.title}
                  </span>
                  <VacancyMetaRow
                    city={item.city}
                    experience={item.experience}
                    format={item.format}
                    salary={item.salary}
                  />
                </div>
                <span
                  className="shrink-0 text-h2 leading-none font-light text-text-secondary group-open:hidden"
                  aria-hidden
                >
                  +
                </span>
                <span
                  className="hidden shrink-0 text-h2 leading-none font-light text-text-secondary group-open:inline"
                  aria-hidden
                >
                  −
                </span>
              </summary>
              <div className="flex flex-col gap-4 border-t border-black/30 p-8 pt-6 group-open:border-brand/30">
                {item.description ? (
                  <StaticProse html={item.description} />
                ) : null}
                <ResumeMailtoButton email={resumeEmail} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VacancyPageContent({
  sections,
  breadcrumbs,
}: {
  sections: VacancySections;
  breadcrumbs: BreadcrumbItem[];
}) {
  const workHtml = sections.hero?.text?.trim();

  return (
    <div className="flex flex-col pb-16">
      {sections.hero ? (
        <VacancyHero hero={sections.hero} breadcrumbs={breadcrumbs} />
      ) : (
        <div className="mx-auto w-full max-w-[1564px] px-4 pt-8 sm:px-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-[1564px] flex-col gap-12 px-4 pt-12 sm:px-8 md:gap-16 md:pt-16">
        {workHtml ? <StaticProse html={workHtml} className="max-w-3xl" /> : null}
        <VacancyHrBlock hr={sections.hr} />
        <VacancyList
          vacancies={sections.vacancies}
          resumeEmail={sections.hr.email}
        />
      </div>
    </div>
  );
}
