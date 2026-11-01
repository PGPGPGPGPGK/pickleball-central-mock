"use client";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { WithParams } from "@/components/demo/Params";
import { istToday } from "@/lib/format";

export default function PlayPage() {
  return (
    <WithParams
      render={(q) => {
        const court = Number(q.get("rebookCourt"));
        const minutes = Number(q.get("duration"));
        const rebook = Number.isInteger(court) && court > 0 ? { court, duration: Number.isFinite(minutes) && minutes ? minutes : 60 } : null;
        return <BookingFlow today={istToday()} rebook={rebook} />;
      }}
    />
  );
}
