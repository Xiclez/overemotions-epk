"use client";

/**
 * shadcn/ui Tooltip on Radix. Used only for supplementary detail — never for
 * information a booker needs, because tooltips are hover/focus-only and this
 * site cannot rely on hover.
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[var(--z-modal)] max-w-64 border border-border-strong bg-charcoal px-3 py-2",
          "label text-label-xs text-bone",
          "rounded-[var(--radius-chip)] shadow-[var(--shadow-plate)]",
          "data-[state=delayed-open]:animate-fade-in",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
