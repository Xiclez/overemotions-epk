"use client";

/**
 * Drawer built on vaul (the library shadcn/ui uses for its Drawer/Sheet).
 * vaul handles: drag-to-dismiss, Escape, focus trap, scroll lock, aria roles.
 *
 * Direction is set per-instance: the Booking Dossier opens from the right on
 * desktop and from the bottom on mobile (thumb zone).
 */

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerClose = DrawerPrimitive.Close;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerTitle = DrawerPrimitive.Title;
const DrawerDescription = DrawerPrimitive.Description;

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[var(--z-overlay)] bg-void/85 backdrop-blur-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  side = "right",
  showHandle = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  side?: "right" | "bottom";
  showHandle?: boolean;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          "fixed z-[var(--z-drawer)] flex flex-col bg-charcoal outline-none",
          side === "right"
            ? "inset-y-0 right-0 w-full max-w-lg border-l border-border-strong"
            : "inset-x-0 bottom-0 max-h-[92svh] border-t border-border-strong",
          className,
        )}
        {...props}
      >
        {showHandle && side === "bottom" && (
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1 w-12 shrink-0 bg-border-strong"
          />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerCloseButton({ className }: { className?: string }) {
  return (
    <DrawerPrimitive.Close
      aria-label="Close booking dossier"
      className={cn(
        "grid size-11 shrink-0 place-items-center border border-border-strong text-bone",
        "transition-colors duration-[var(--duration-fast)]",
        "hover:border-acid hover:text-acid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid",
        className,
      )}
    >
      <X className="size-5" />
    </DrawerPrimitive.Close>
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerDescription,
};
