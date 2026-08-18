"use client";

import { useEffect, useRef } from "react";

import { distributeOtpPaste, extractOtpDigits } from "@/lib/account/otp-code";
import { cn } from "@/lib/utils";

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Visual label id for `aria-labelledby` on the cell group. */
  labelId: string;
  idPrefix: string;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
  /** Bump to move focus back to the first cell (e.g. after a failed code). */
  focusSignal?: number;
};

/**
 * Segmented one-time-code field: one input per digit, with auto-advance,
 * backspace/arrow navigation and paste distribution.
 */
export function OtpInput({
  value,
  onChange,
  labelId,
  idPrefix,
  length = 4,
  disabled = false,
  invalid = false,
  describedBy,
  autoFocus = false,
  focusSignal = 0,
}: OtpInputProps) {
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");

  // Deferred: the dialog reclaims focus when the previous step unmounts.
  useEffect(() => {
    if (!autoFocus && focusSignal === 0) return;
    const id = requestAnimationFrame(() => cellRefs.current[0]?.focus());
    return () => cancelAnimationFrame(id);
  }, [autoFocus, focusSignal]);

  function focusCell(index: number) {
    const clamped = Math.max(0, Math.min(index, length - 1));
    const el = cellRefs.current[clamped];
    el?.focus();
    el?.select();
  }

  function commit(next: string[], focusIndex: number) {
    onChange(next.join(""));
    focusCell(focusIndex);
  }

  function onCellChange(index: number, raw: string) {
    const digits = extractOtpDigits(raw, length);
    if (!digits) {
      if (raw === "" && cells[index]) {
        const next = [...cells];
        next[index] = "";
        onChange(next.join(""));
      }
      return;
    }

    if (digits.length > 1) {
      const { cells: next, focusIndex } = distributeOtpPaste(
        cells,
        digits,
        index,
      );
      commit(next, focusIndex);
      return;
    }

    const next = [...cells];
    next[index] = digits;
    commit(next, index + 1);
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (cells[index]) return;
      event.preventDefault();
      if (index === 0) return;
      const next = [...cells];
      next[index - 1] = "";
      commit(next, index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  }

  function onPaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!extractOtpDigits(pasted, length)) return;
    event.preventDefault();
    const { cells: next, focusIndex } = distributeOtpPaste(
      cells,
      pasted,
      index,
    );
    commit(next, focusIndex);
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className={cn(
        "flex gap-2",
        invalid && "animate-shake motion-reduce:animate-none",
      )}
    >
      {cells.map((cell, index) => (
        <input
          key={index}
          ref={(el) => {
            cellRefs.current[index] = el;
          }}
          id={index === 0 ? idPrefix : `${idPrefix}-${index + 1}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Цифра ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={cell}
          onChange={(e) => onCellChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={(e) => onPaste(index, e)}
          onFocus={(e) => e.currentTarget.select()}
          onClick={() => {
            const firstEmpty = Math.min(value.length, length - 1);
            if (index > firstEmpty) focusCell(firstEmpty);
          }}
          className={cn(
            "h-14 w-12 rounded-sm border border-input bg-background text-center font-display text-h3 text-text-heading",
            "transition-[color,border-color,box-shadow] outline-none max-[360px]:w-11",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        />
      ))}
    </div>
  );
}
