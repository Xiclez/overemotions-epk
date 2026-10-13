"use client";

/**
 * shadcn/ui Tabs on Radix. Keyboard: arrow keys move, Home/End jump — handled by
 * Radix. Active state is signalled by colour AND a solid indicator bar AND a
 * bracket glyph, so it never depends on colour alone.
 */

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "no-scrollbar flex w-full items-stretch gap-0 overflow-x-auto",
        "border-y border-border",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "group relative flex min-h-11 shrink-0 items-center gap-2 px-5 py-3",
        "label text-label-sm text-muted-foreground",
        "border-r border-border last:border-r-0",
        "transition-colors duration-[var(--duration-fast)]",
        "hover:text-bone",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acid",
        "data-[state=active]:bg-charcoal data-[state=active]:text-acid",
        className,
      )}
      {...props}
    >
      {/* Non-colour active affordance */}
      <span
        aria-hidden="true"
        className="text-acid opacity-0 transition-opacity group-data-[state=active]:opacity-100"
      >
        /
      </span>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-acid",
          "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-industrial)]",
          "group-data-[state=active]:scale-x-100",
        )}
      />
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
