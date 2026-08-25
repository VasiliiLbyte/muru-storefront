import { NavLink } from "@/components/layout/nav-link";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function HeaderTopNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Верхнее меню"
      className={cn("hidden items-center gap-6 lg:flex", className)}
    >
      {mainNav.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          accent={item.accent}
          className="py-3"
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
