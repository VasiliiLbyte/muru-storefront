"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Sheet (боковая панель) в стиле shadcn поверх @base-ui/react Dialog.
 * Используется для мобильного меню. Анимации сдержанные; глобальный
 * prefers-reduced-motion (globals.css) отключает переходы.
 */
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

function SheetBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[60] bg-black/40 opacity-100 transition-opacity duration-300 ease-in-out",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-open:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

const sideClasses = {
  left: "inset-y-0 left-0 h-full w-[88vw] max-w-sm border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  right:
    "inset-y-0 right-0 h-full w-[88vw] max-w-sm border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] w-full max-w-none rounded-t-lg border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
} as const;

/** Насколько нужно протянуть, чтобы шторка закрылась. */
const SWIPE_CLOSE_RATIO = 0.3;
const SWIPE_CLOSE_MIN_PX = 56;
/** Ниже этого угла жест считаем вертикальной прокруткой, а не свайпом. */
const SWIPE_DIRECTION_LOCK_PX = 12;

function SheetContent({
  className,
  children,
  side = "left",
  showClose = true,
  backdropClassName,
  onSwipeClose,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: keyof typeof sideClasses;
  showClose?: boolean;
  backdropClassName?: string;
  /** Закрытие свайпом «наружу»: влево для левой шторки, вправо для правой. */
  onSwipeClose?: () => void;
}) {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{
    startX: number;
    startY: number;
    dx: number;
    axis: "none" | "x" | "y";
  } | null>(null);

  const swipeable = Boolean(onSwipeClose) && (side === "left" || side === "right");
  // Наружу = влево для левой шторки, вправо для правой.
  const outward = side === "left" ? -1 : 1;

  const setOffset = (px: number, animate: boolean) => {
    const el = popupRef.current;
    if (!el) return;
    el.style.transition = animate ? "" : "none";
    el.style.transform = px === 0 ? "" : `translateX(${px}px)`;
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!swipeable || e.touches.length !== 1) return;
    const t = e.touches[0]!;
    drag.current = { startX: t.clientX, startY: t.clientY, dx: 0, axis: "none" };
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const d = drag.current;
    if (!swipeable || !d || e.touches.length !== 1) return;
    const t = e.touches[0]!;
    const dx = t.clientX - d.startX;
    const dy = t.clientY - d.startY;

    if (d.axis === "none") {
      if (Math.abs(dx) < SWIPE_DIRECTION_LOCK_PX && Math.abs(dy) < SWIPE_DIRECTION_LOCK_PX) return;
      // Один раз решаем, это свайп или прокрутка содержимого.
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (d.axis !== "x") return;

    // Тянуть можно только наружу; внутрь шторка не уезжает.
    const offset = outward < 0 ? Math.min(0, dx) : Math.max(0, dx);
    d.dx = offset;
    setOffset(offset, false);
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    const d = drag.current;
    drag.current = null;
    if (!swipeable || !d || d.axis !== "x") return;

    const width = popupRef.current?.offsetWidth ?? 0;
    const threshold = Math.max(SWIPE_CLOSE_MIN_PX, width * SWIPE_CLOSE_RATIO);

    if (Math.abs(d.dx) >= threshold) {
      // Отдаём анимацию закрытия самой шторке (data-ending-style).
      setOffset(0, true);
      onSwipeClose?.();
    } else {
      setOffset(0, true);
    }
  };

  return (
    <SheetPortal>
      <SheetBackdrop className={backdropClassName} />
      <SheetPrimitive.Popup
        ref={popupRef}
        onTouchStart={swipeable ? onTouchStart : undefined}
        onTouchMove={swipeable ? onTouchMove : undefined}
        onTouchEnd={swipeable ? onTouchEnd : undefined}
        onTouchCancel={swipeable ? onTouchEnd : undefined}
        className={cn(
          "fixed z-[61] flex flex-col gap-6 overflow-y-auto bg-surface p-6 shadow-(--shadow-overlay) outline-none",
          "border-border transition-transform duration-300 ease-in-out",
          swipeable && "touch-pan-y",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <SheetPrimitive.Close
            aria-label="Закрыть меню"
            className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" />
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 pr-10", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetBackdrop,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
