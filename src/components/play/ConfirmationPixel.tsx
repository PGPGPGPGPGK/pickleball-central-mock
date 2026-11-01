"use client";

/**
 * Fires the Purchase conversion once, on the /play/confirmation page — a
 * stable page load that survives the redirect from the booking drawer (firing
 * it mid-redirect risks the pixel beacon being cancelled).
 *
 * `eventId` is the payment id: the server-side Meta Conversions API sends the
 * same `event_id`, so Meta collapses the browser + server Purchase into one
 * conversion instead of double-counting.
 */
import { useEffect, useRef } from "react";

import { track } from "@/lib/analytics";

export function ConfirmationPixel({ value, paymentId }: { value?: number; paymentId?: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(
      "Purchase",
      { currency: "INR", ...(typeof value === "number" && value > 0 ? { value } : {}) },
      paymentId ? { eventId: paymentId } : undefined,
    );
  }, [value, paymentId]);
  return null;
}
