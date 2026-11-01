// Number Ticker — based on Magic UI number-ticker component.
// Animates a number from 0 (or start value) up to target on scroll-into-view.
// Uses framer-motion spring physics for natural deceleration.

"use client";

import { useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef } from "react";

type NumberTickerProps = {
  value: number;
  direction?: "up" | "down";
  delay?: number; // in seconds
  decimalPlaces?: number;
  className?: string;
};

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-IN", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)));
      }
    });
    return unsubscribe;
  }, [springValue, decimalPlaces]);

  // Fallback static render on SSR so the number shows even before JS loads
  return (
    <span className={className} ref={ref}>
      {direction === "down" ? value : 0}
    </span>
  );
}

// Helper hook — just delegates to the component, not strictly needed but
// matches the Magic UI export style so existing docs/references still work.
export { animate };
