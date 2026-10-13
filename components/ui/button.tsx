"use client";

/**
 * shadcn/ui Button, retokenised for the Over Emotions system:
 * square corners, hairline borders, condensed uppercase labels, no soft shadows.
 * Every variant meets the 44px minimum touch target at `default` size and above.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "group/btn relative inline-flex shrink-0 items-center justify-center gap-2",
    "label text-label-sm whitespace-nowrap select-none",
    "rounded-[var(--radius-chip)] border transition-all",
    "duration-[var(--duration-fast)] ease-[var(--ease-out-industrial)]",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-acid",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        /** The one primary action per screen. Solid acid plate. */
        primary: cn(
          "border-acid bg-acid text-void",
          "hover:bg-bone hover:border-bone",
          "active:translate-y-px",
        ),
        /** Bone outline. Secondary CTAs. */
        outline: cn(
          "border-border-strong bg-transparent text-bone",
          "hover:border-acid hover:text-acid",
          "active:translate-y-px",
        ),
        /** Blood-red plate for the hard-techno-flavoured moments. */
        ultra: cn(
          "border-ultra bg-ultra text-bone",
          "hover:bg-acid hover:border-acid hover:text-void",
          "active:translate-y-px",
        ),
        /** Charcoal plate, sits inside dark panels. */
        plate: cn(
          "border-border bg-charcoal text-bone",
          "hover:border-border-strong hover:bg-iron",
          "active:translate-y-px",
        ),
        /** No chrome until interacted with. Nav items, tabs, small controls. */
        ghost: cn(
          "border-transparent bg-transparent text-muted-foreground",
          "hover:text-acid",
        ),
        /** Text-only with an animated underline. Inline links. */
        link: cn(
          "border-transparent bg-transparent text-bone px-0",
          "underline-offset-4 hover:text-acid hover:underline",
        ),
      },
      size: {
        /** 32px — dense controls only; always paired with an extended hit area. */
        sm: "h-8 px-3 text-label-xs",
        /** 44px — the default. Meets the touch-target floor. */
        default: "h-11 px-6",
        /** 56px — hero and finale CTAs. */
        lg: "h-14 px-8 text-label-md",
        /** Square icon button at the 44px floor. */
        icon: "size-11",
        iconSm: "size-9",
      },
    },
    defaultVariants: { variant: "outline", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
