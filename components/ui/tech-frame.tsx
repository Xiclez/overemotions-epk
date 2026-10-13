"use client";

/**
 * Industrial furniture: TechFrame, CornerTicks, SectionHeader, Readout, DataRow.
 *
 * This is the vocabulary that keeps the site from becoming a stack of rounded
 * cards: hairline plate frames, corner registration ticks, small section numbers,
 * BPM readouts, technical labels.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Registration ticks in the corners of a frame. Purely structural decoration. */
export function CornerTicks({
  className,
  size = 10,
  color = "border-border-strong",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  const arm = `${size}px`;
  return (
    <span aria-hidden="true" className={cn("pointer-events-none", className)}>
      {(
        [
          ["top-0 left-0", "border-t border-l"],
          ["top-0 right-0", "border-t border-r"],
          ["bottom-0 left-0", "border-b border-l"],
          ["bottom-0 right-0", "border-b border-r"],
        ] as const
      ).map(([pos, borders]) => (
        <span
          key={pos}
          className={cn("absolute", pos, borders, color)}
          style={{ width: arm, height: arm }}
        />
      ))}
    </span>
  );
}

/**
 * Metal-plate container. `cut` adds the diagonal corner cut that replaces
 * border-radius everywhere in this design.
 */
export function TechFrame({
  children,
  className,
  cut = false,
  ticks = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  cut?: boolean;
  ticks?: boolean;
  /** Intrinsic elements only — keeps the children/className contract sound. */
  as?: Extract<
    keyof React.JSX.IntrinsicElements,
    "div" | "section" | "article" | "aside" | "figure"
  >;
}) {
  return (
    <Tag
      className={cn(
        "relative border border-border bg-charcoal/70",
        "shadow-[var(--shadow-inset-plate)]",
        cut && "cut-corner",
        className,
      )}
    >
      {ticks && !cut && <CornerTicks />}
      {children}
    </Tag>
  );
}

/** Small technical readout: LABEL over VALUE, tabular figures. */
export function Readout({
  label,
  value,
  className,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="label text-label-xs text-gray">{label}</span>
      <span
        className={cn(
          "label text-label-md tabular-nums",
          accent ? "text-acid" : "text-bone",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Section header: number, rule, title, optional kicker.
 * Shared by every section so the editorial rhythm stays identical.
 */
export function SectionHeader({
  number,
  title,
  kicker,
  align = "left",
  className,
  id,
}: {
  number: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4",
          align === "center" && "justify-center",
        )}
      >
        <span className="label text-label-xs tabular-nums text-acid">
          {number}
        </span>
        <span aria-hidden="true" className="h-px w-12 bg-border-strong" />
        {kicker && (
          <span className="label text-label-xs text-gray">{kicker}</span>
        )}
      </div>
      <h2
        id={id}
        className="font-display text-display-sm text-bone uppercase"
      >
        {title}
      </h2>
    </div>
  );
}

/** Key/value row used in the dossier and the rider blocks. */
export function DataRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,7rem)_1fr] gap-4 border-b border-border py-3 last:border-b-0",
        className,
      )}
    >
      <span className="label text-label-xs text-gray">{label}</span>
      <span className="text-body-sm text-bone">{children}</span>
    </div>
  );
}

/**
 * BPM chip. The unit suffix is only appended when the value is actually numeric —
 * OPEN FORMAT reports "READ THE ROOM", which must not read as "READ THE ROOM BPM".
 */
export function BpmTag({
  bpm,
  className,
}: {
  bpm: string;
  className?: string;
}) {
  const numeric = /\d/.test(bpm);
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-2 border border-border px-2 py-1 text-label-xs text-bone-dim",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-acid" />
      <span className={cn(numeric && "tabular-nums")}>{bpm}</span>
      {numeric && <span className="text-gray">BPM</span>}
    </span>
  );
}
