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
  "h-[45px] self-start rounded-none px-8 text-base font-medium hover:bg-brand-hover";

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
        <div className="absolute top-1/2 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 bg-background px-[70px] py-10 text-center max-md:px-8 max-md:py-8 max-sm:static max-sm:mx-auto max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0">
          <h1 className="text-[24px] leading-[29px] font-light tracking-normal text-[#6B6B6B] uppercase">
            {hero.heading}
          </h1>
          {hero.text ? (
            <StaticProse
              html={hero.text}
              className="text-center text-[#5B5B5B] [&_p:last-child]:mb-0"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function VacancyHrCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[18px] leading-[22px] font-normal text-[#2F2F2F]">
        {label}
      </span>
      <span className="text-[#5B5B5B]">{children}</span>
    </div>
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
    <section className="flex flex-col gap-6 border-y border-[#E6E8EB] py-8">
      {hr.heading ? (
        <h2 className="text-[24px] font-medium text-[#2F2F2F] uppercase">
          {hr.heading}
        </h2>
      ) : null}
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:justify-between">
        {name ? (
          <VacancyHrCell label="Контактное лицо">{name}</VacancyHrCell>
        ) : null}
        {phone ? (
          <VacancyHrCell label="Телефон">
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              {phone}
            </a>
          </VacancyHrCell>
        ) : null}
        {email ? (
          <VacancyHrCell label="E-mail">
            <a
              href={`mailto:${email}`}
              className="transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              {email}
            </a>
          </VacancyHrCell>
        ) : null}
      </div>
      <ResumeMailtoButton email={hr.email} />
    </section>
  );
}

function VacancyMetaRow({
  city,
  experience,
  format,
}: {
  city: string;
  experience: string;
  format: string;
}) {
  const cells = [
    { key: "city", value: city },
    { key: "experience", value: experience },
    { key: "format", value: format },
  ].filter((c) => c.value.trim());

  if (cells.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 text-[#5B5B5B]">
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
    <section className="flex flex-col gap-8">
      {vacancies.heading ? (
        <h2 className="text-[24px] font-semibold text-[#2F2F2F] uppercase">
          {vacancies.heading}
        </h2>
      ) : null}
      <ul className="flex flex-col gap-6">
        {vacancies.items.map((item) => {
          const salary = item.salary.trim();
          return (
            <li key={item.id}>
              <details className="group rounded-none border border-[#E6E8EB] transition-colors hover:border-brand-hover open:border-brand-hover">
                <summary className="relative flex cursor-pointer list-none items-start justify-between gap-4 p-8 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <span className="text-[20px] leading-[24px] font-medium text-[#2F2F2F] uppercase">
                      {item.title}
                    </span>
                    <VacancyMetaRow
                      city={item.city}
                      experience={item.experience}
                      format={item.format}
                    />
                  </div>
                  {salary ? (
                    <span className="shrink-0 pr-8 text-base font-medium text-[#2F2F2F]">
                      {salary}
                    </span>
                  ) : null}
                  <span
                    className="absolute top-[38px] right-8 text-[16px] leading-none text-[#5B5B5B] group-open:hidden"
                    aria-hidden
                  >
                    +
                  </span>
                  <span
                    className="absolute top-[38px] right-8 hidden text-[16px] leading-none text-[#5B5B5B] group-open:inline"
                    aria-hidden
                  >
                    −
                  </span>
                </summary>
                <div className="flex flex-col gap-6 border-t border-[#E6E8EB] px-8 pt-6 pb-8 group-open:border-brand-hover/40">
                  {item.description ? (
                    <StaticProse html={item.description} className="text-[15px]" />
                  ) : null}
                  <ResumeMailtoButton email={resumeEmail} />
                </div>
              </details>
            </li>
          );
        })}
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
  return (
    <div className="flex flex-col pb-16">
      {sections.hero ? (
        <VacancyHero hero={sections.hero} breadcrumbs={breadcrumbs} />
      ) : (
        <div className="mx-auto w-full max-w-[1564px] px-4 pt-8 sm:px-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-[1564px] flex-col gap-12 px-4 pt-[clamp(40px,5vw,64px)] sm:px-8 md:gap-16">
        <VacancyHrBlock hr={sections.hr} />
        <VacancyList
          vacancies={sections.vacancies}
          resumeEmail={sections.hr.email}
        />
      </div>
    </div>
  );
}
