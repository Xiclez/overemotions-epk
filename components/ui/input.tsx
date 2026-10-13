"use client";

/**
 * Form primitives: Input, Textarea, Label, FieldError, Field.
 * Rules encoded here: visible labels (never placeholder-only), 44px minimum
 * height, errors rendered below the field with role="alert", required marked
 * both visually and via aria-required.
 */

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase = cn(
  "w-full border bg-void/60 px-4 text-body-md text-bone",
  "rounded-[var(--radius-chip)] border-border",
  "placeholder:text-gray/70",
  "transition-colors duration-[var(--duration-fast)]",
  "hover:border-border-strong",
  "focus:border-acid focus:bg-void focus:outline-none",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acid",
  "aria-invalid:border-ultra",
  "disabled:opacity-40",
);

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldBase, "min-h-32 resize-y py-3", className)}
      {...props}
    />
  );
}

function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "label flex items-center gap-1 text-label-xs text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-acid" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
}

/** Persistent helper text. Sits under the field, never inside as a placeholder. */
function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-label-xs label text-gray/80", className)}
      {...props}
    />
  );
}

function FieldError({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        "label flex items-center gap-1.5 text-label-xs text-ultra",
        className,
      )}
      {...props}
    >
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Label + control + hint/error stack with correct id wiring. */
function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? (
        <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
      ) : hint ? (
        <FieldHint id={`${htmlFor}-hint`}>{hint}</FieldHint>
      ) : null}
    </div>
  );
}

export { Input, Textarea, Label, Field, FieldError, FieldHint, fieldBase };
