"use client";
import { BookingConfirmation } from "@/components/checkout/BookingConfirmation";
import { WithParams } from "@/components/demo/Params";

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6 md:pt-12">
      <WithParams render={(q) => (q.get("booking") ? <BookingConfirmation bookingId={q.get("booking")!} /> : <p className="mt-8 text-[#CBD5E1]">No booking reference.</p>)} />
    </div>
  );
}
