"use client";

/** shadcn/ui Select on Radix, restyled. Keyboard + typeahead come from Radix. */

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectGroup = SelectPrimitive.Group;

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-12 w-full items-center justify-between gap-2",
        "border border-border bg-void/60 px-4",
        "rounded-[var(--radius-chip)]",
        "label text-label-sm text-bone",
        "transition-colors duration-[var(--duration-fast)]",
        "hover:border-border-strong",
        "focus:border-acid focus:outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acid",
        "data-[placeholder]:text-gray/70",
        "aria-invalid:border-ultra",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-acid" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={4}
        className={cn(
          "z-[var(--z-modal)] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden",
          "border border-border-strong bg-charcoal",
          "rounded-[var(--radius-plate)] shadow-[var(--shadow-plate)]",
          "data-[state=open]:animate-fade-in",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-11 cursor-pointer items-center gap-2 pr-3 pl-8",
        "label text-label-sm text-bone-dim outline-none",
        "transition-colors duration-[var(--duration-instant)]",
        "data-[highlighted]:bg-iron data-[highlighted]:text-acid",
        "data-[state=checked]:text-acid",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 grid size-4 place-items-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export {
  Select,
  SelectValue,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
