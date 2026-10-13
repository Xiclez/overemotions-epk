"use client";

/**
 * shadcn/ui Dialog on Radix. Radix gives us, for free and correctly:
 * Escape to close, focus trap, focus restore, body scroll lock, aria wiring.
 * We only restyle.
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[var(--z-overlay)] bg-void/88 backdrop-blur-[2px]",
        "data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100vw-2rem)] max-w-4xl",
          "-translate-x-1/2 -translate-y-1/2",
          "border border-border-strong bg-charcoal",
          "rounded-[var(--radius-plate)] shadow-[var(--shadow-plate-lg)]",
          "max-h-[90svh] overflow-y-auto",
          "data-[state=open]:animate-plate-in",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              "absolute top-3 right-3 z-10 grid size-11 place-items-center",
              "border border-border-strong bg-void/80 text-bone",
              "transition-colors duration-[var(--duration-fast)]",
              "hover:border-acid hover:text-acid",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid",
            )}
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "flex flex-col gap-1 border-b border-border px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("label text-label-lg text-bone", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
};
