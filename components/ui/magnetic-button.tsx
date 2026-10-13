"use client";

/**
 * MagneticButton — the button leans toward the pointer while it is nearby.
 *
 * Desktop / fine-pointer only, and only at the HIGH quality tier: on touch it is
 * a plain button with zero extra listeners. The displacement is capped at 10px so
 * it reads as weight rather than as a toy, and springs are damped with no
 * overshoot (nothing in this build bounces).
 */

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useQuality } from "@/components/over-emotions/frequency-provider";
import { qualityProfile } from "@/lib/webgl";

export interface MagneticButtonProps extends ButtonProps {
  /** Maximum displacement in px. Keep it small. */
  strength?: number;
  /** Distance in px at which the pull starts. */
  radius?: number;
}

export function MagneticButton({
  strength = 10,
  radius = 140,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const quality = useQuality();
  const enabled = !reduced && qualityProfile[quality].parallax;

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, spring.snappy);
  const y = useSpring(mvY, spring.snappy);

  React.useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > radius) {
        mvX.set(0);
        mvY.set(0);
        return;
      }
      // Falls off linearly toward the edge of the radius
      const pull = (1 - dist / radius) * strength;
      mvX.set((dx / (dist || 1)) * pull);
      mvY.set((dy / (dist || 1)) * pull);
    };

    const onLeave = () => {
      mvX.set(0);
      mvY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, mvX, mvY, radius, strength]);

  if (!enabled) {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="inline-block will-change-transform"
    >
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

export default MagneticButton;
