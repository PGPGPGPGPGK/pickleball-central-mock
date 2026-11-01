// Background Gradient Animation — inspired by Aceternity UI's component
// of the same name. CSS-only animated radial gradients that slowly orbit.
// Used for the final CTA band and any accent strip that needs subtle motion.

"use client";

import { useEffect, useRef } from "react";

type BackgroundGradientAnimationProps = {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  size?: string;
  className?: string;
  children?: React.ReactNode;
  containerClassName?: string;
};

export function BackgroundGradientAnimation({
  gradientBackgroundStart = "rgb(10, 15, 30)",
  gradientBackgroundEnd = "rgb(17, 24, 39)",
  firstColor = "200, 244, 0", // volt
  secondColor = "13, 115, 119", // court teal
  thirdColor = "30, 58, 95", // court blue
  size = "80%",
  className = "",
  children,
  containerClassName = "",
}: BackgroundGradientAnimationProps) {
  const interactiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the CSS vars once on mount so the CSS animation can read them
    const root = interactiveRef.current;
    if (!root) return;
    root.style.setProperty("--gradient-bg-start", gradientBackgroundStart);
    root.style.setProperty("--gradient-bg-end", gradientBackgroundEnd);
    root.style.setProperty("--first-color", firstColor);
    root.style.setProperty("--second-color", secondColor);
    root.style.setProperty("--third-color", thirdColor);
    root.style.setProperty("--size", size);
  }, [gradientBackgroundStart, gradientBackgroundEnd, firstColor, secondColor, thirdColor, size]);

  return (
    <div
      ref={interactiveRef}
      className={`relative overflow-hidden bg-[linear-gradient(to_bottom_right,var(--gradient-bg-start),var(--gradient-bg-end))] ${containerClassName}`}
    >
      {/* Gradient blobs */}
      <div className={`gradients-container absolute inset-0 ${className}`}>
        <div
          className="absolute h-[var(--size)] w-[var(--size)] rounded-full blur-3xl mix-blend-normal opacity-60 animate-blob-1"
          style={{
            background: `radial-gradient(circle at center, rgba(var(--first-color), 0.5) 0, rgba(var(--first-color), 0) 50%) no-repeat`,
            top: "0%",
            left: "0%",
          }}
        />
        <div
          className="absolute h-[var(--size)] w-[var(--size)] rounded-full blur-3xl mix-blend-normal opacity-60 animate-blob-2"
          style={{
            background: `radial-gradient(circle at center, rgba(var(--second-color), 0.5) 0, rgba(var(--second-color), 0) 50%) no-repeat`,
            top: "30%",
            right: "0%",
          }}
        />
        <div
          className="absolute h-[var(--size)] w-[var(--size)] rounded-full blur-3xl mix-blend-normal opacity-40 animate-blob-3"
          style={{
            background: `radial-gradient(circle at center, rgba(var(--third-color), 0.5) 0, rgba(var(--third-color), 0) 50%) no-repeat`,
            bottom: "0%",
            left: "30%",
          }}
        />
      </div>

      {/* Keyframes live in globals.css — .animate-blob-1/2/3 classes */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
