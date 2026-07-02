import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Styleguide",
  // Внутренняя страница для визуальной сверки — вне индексации и sitemap.
  robots: { index: false, follow: false },
};

type Swatch = {
  name: string;
  token: string;
  hex: string;
  className: string;
  border?: boolean;
};

const brandColors: Swatch[] = [
  { name: "Brand", token: "--color-brand", hex: "#5d6b3a", className: "bg-brand" },
  {
    name: "Brand Hover",
    token: "--color-brand-hover",
    hex: "#879650",
    className: "bg-brand-hover",
  },
];

const neutralColors: Swatch[] = [
  {
    name: "Background",
    token: "--color-background",
    hex: "#fcfbfb",
    className: "bg-background",
    border: true,
  },
  {
    name: "Surface",
    token: "--color-surface",
    hex: "#f4f0e8",
    className: "bg-surface",
    border: true,
  },
  {
    name: "Line / Border",
    token: "--color-line",
    hex: "#d1cdcd",
    className: "bg-line",
  },
];

const textColors: Swatch[] = [
  {
    name: "Text Heading",
    token: "--color-text-heading",
    hex: "#2f2f2f",
    className: "bg-text-heading",
  },
  {
    name: "Text Primary",
    token: "--color-text-primary",
    hex: "#555558",
    className: "bg-text-primary",
  },
  {
    name: "Text Secondary",
    token: "--color-text-secondary",
    hex: "#5b5b5b",
    className: "bg-text-secondary",
  },
  {
    name: "Text Muted",
    token: "--color-text-muted",
    hex: "#b8b8b8",
    className: "bg-text-muted",
  },
  {
    name: "Text Inverse",
    token: "--color-text-inverse",
    hex: "#ffffff",
    className: "bg-text-inverse",
    border: true,
  },
];

const stateColors: Swatch[] = [
  { name: "Error", token: "--color-error", hex: "#e03a43", className: "bg-error" },
  {
    name: "Success",
    token: "--color-success",
    hex: "#2a4c39",
    className: "bg-success",
  },
  {
    name: "Warning",
    token: "--color-warning",
    hex: "#ffc117",
    className: "bg-warning",
  },
];

const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 64];

const radii: { name: string; token: string; value: string; className: string }[] =
  [
    { name: "sm", token: "--radius-sm", value: "0px", className: "rounded-sm" },
    { name: "md", token: "--radius-md", value: "50px", className: "rounded-md" },
    { name: "lg", token: "--radius-lg", value: "100px", className: "rounded-lg" },
  ];

const durations = [
  { name: "fast", token: "--duration-fast", value: "0.3s" },
  { name: "base", token: "--duration-base", value: "0.5s" },
  { name: "slow", token: "--duration-slow", value: "0.8s" },
];

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-line pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-h2 text-text-heading">{title}</h2>
        {subtitle ? (
          <p className="text-small text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ColorGroup({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-caption font-medium tracking-wide text-text-muted uppercase">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {swatches.map((s) => (
          <div key={s.token} className="flex flex-col gap-2">
            <div
              className={`h-20 w-full rounded-sm ${s.className} ${
                s.border ? "border border-line" : ""
              }`}
            />
            <div className="flex flex-col">
              <span className="text-small text-text-primary">{s.name}</span>
              <span className="font-mono text-[12px] text-text-muted">
                {s.hex}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                {s.token}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1564px] px-8 py-16">
      <header className="flex flex-col gap-3 pb-10">
        <p className="text-caption font-medium tracking-wide text-brand uppercase">
          MURU · Design System
        </p>
        <h1 className="font-display text-display text-text-heading">
          Styleguide
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          Внутренняя страница для визуальной сверки токенов и примитивов с
          характером muru.ru: editorial / slow-living, мягкий оливковый бренд,
          резкие углы, плоская глубина, спокойный ритм.
        </p>
      </header>

      <div className="flex flex-col gap-12">
        <Section title="Colors" subtitle="Палитра из docs/DESIGN.md">
          <div className="flex flex-col gap-8">
            <ColorGroup title="Brand" swatches={brandColors} />
            <ColorGroup title="Neutral / Surfaces" swatches={neutralColors} />
            <ColorGroup title="Text" swatches={textColors} />
            <ColorGroup title="System States" swatches={stateColors} />
          </div>
        </Section>

        <Section
          title="Typography"
          subtitle="Mulish · дисплей и тело одним семейством (веса 300/400/500)"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-display text-text-heading">
                H1 · Display 36/1.2
              </h1>
              <span className="font-mono text-[12px] text-text-muted">
                --text-display · weight 400
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-h2 text-text-heading">
                H2 · Heading 36/1.2
              </h2>
              <span className="font-mono text-[12px] text-text-muted">
                --text-h2 · weight 400
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-[28px] leading-[1.2] text-text-heading">
                H3 · 28/1.2
              </h3>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-display text-[22px] leading-[1.2] text-text-heading">
                H4 · 22/1.2
              </h4>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="font-display text-[18px] leading-[1.2] text-text-heading">
                H5 · 18/1.2
              </h5>
            </div>
            <div className="flex flex-col gap-1">
              <h6 className="font-display text-body text-text-heading">
                H6 · 16/1.2
              </h6>
            </div>

            <div className="flex max-w-2xl flex-col gap-4 border-t border-line pt-6">
              <p className="text-body text-text-primary">
                Body · 16/1.5 · weight 300. Спокойный ритм и воздух: «Тихая
                природная эстетика, мягкие оливковые акценты и щедрые отступы
                задают неспешное editorial-настроение». The quick brown fox
                jumps over the lazy dog.
              </p>
              <p className="text-small text-text-secondary">
                Small · 14/1.5 — вторичный текст и описания.
              </p>
              <p className="text-caption font-medium tracking-wide text-text-muted uppercase">
                Caption · 14/1.2 · weight 500 — навигация, метки, бейджи
              </p>
              <code className="font-mono text-small text-text-primary">
                Mono · 14 — технические значения и токены
              </code>
            </div>
          </div>
        </Section>

        <Section title="Spacing" subtitle="База 4px · шкала [4, 8, 12, 16, 20, 24, 32, 40, 64]">
          <div className="flex flex-col gap-3">
            {spacingScale.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className="w-12 font-mono text-[12px] text-text-muted">
                  {s}px
                </span>
                <div
                  className="h-4 rounded-sm bg-brand"
                  style={{ width: `${s}px` }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius" subtitle="Интерактив — 0px; md/lg — для декоративных форм">
          <div className="flex flex-wrap gap-8">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2">
                <div
                  className={`size-24 border border-line bg-surface ${r.className}`}
                />
                <span className="text-small text-text-primary">{r.name}</span>
                <span className="font-mono text-[12px] text-text-muted">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Elevation & Motion"
          subtitle="Плоская глубина (без теней), кроме мягкого оверлея. Анимации сдержанные."
        >
          <div className="flex flex-wrap items-start gap-10">
            <div className="flex flex-col gap-2">
              <div className="flex h-24 w-48 items-center justify-center rounded-sm border border-line bg-background text-small text-text-secondary shadow-(--shadow-card)">
                card · flat
              </div>
              <span className="font-mono text-[12px] text-text-muted">
                --shadow-card: none
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex h-24 w-48 items-center justify-center rounded-sm bg-background text-small text-text-secondary shadow-(--shadow-overlay)">
                overlay · dropdown
              </div>
              <span className="font-mono text-[12px] text-text-muted">
                --shadow-overlay
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-small text-text-primary">
                Durations · ease-in-out
              </span>
              {durations.map((d) => (
                <span
                  key={d.token}
                  className="font-mono text-[12px] text-text-muted"
                >
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Buttons" subtitle="Варианты и состояния">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Каталог</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="Inputs" subtitle="Фокус — рамка/ring в бренд-цвете">
          <div className="flex max-w-md flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="sg-name"
                className="text-body text-text-primary"
              >
                Имя
              </label>
              <Input id="sg-name" placeholder="Введите имя" />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="sg-email"
                className="text-body text-text-primary"
              >
                Email
              </label>
              <Input id="sg-email" type="email" placeholder="name@muru.ru" />
            </div>
            <Input disabled placeholder="Disabled" />
            <Input aria-invalid placeholder="Invalid" defaultValue="Ошибка" />
          </div>
        </Section>

        <Section title="Card" subtitle="Плоский контейнер: фон, граница, воздух">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Декор для дома</CardTitle>
                <CardDescription>Нейтральный плейсхолдер</CardDescription>
              </CardHeader>
              <CardContent>
                Спокойная композиция и щедрые отступы создают ощущение тишины и
                воздуха.
              </CardContent>
              <CardFooter>
                <Button size="sm">В корзину</Button>
                <Button size="sm" variant="ghost">
                  Подробнее
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-surface">
              <CardHeader>
                <CardTitle>На поверхности</CardTitle>
                <CardDescription>Вариант на surface</CardDescription>
              </CardHeader>
              <CardContent>
                Бежевая поверхность для акцентных секций и футера.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Типографика</CardTitle>
                <CardDescription>Mulish · light</CardDescription>
              </CardHeader>
              <CardContent>
                Лёгкие начертания и щедрые межстрочные интервалы.
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </main>
  );
}
