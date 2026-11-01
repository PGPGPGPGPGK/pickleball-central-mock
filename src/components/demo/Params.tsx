"use client";

/** Static-export helper: read query params in the browser and render. */
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

function Read({ render }: { render: (q: URLSearchParams) => ReactNode }) {
  return <>{render(useSearchParams())}</>;
}

export function WithParams({ render }: { render: (q: URLSearchParams) => ReactNode }) {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-xl animate-pulse rounded-2xl bg-white/[0.04]" />}>
      <Read render={render} />
    </Suspense>
  );
}
