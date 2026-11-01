"use client";
import { WithParams } from "@/components/demo/Params";
import { SessionView } from "@/components/session/SessionView";

export default function SessionPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:px-6 md:pt-12">
      <WithParams render={(q) => <SessionView bookingId={q.get("id") ?? ""} />} />
    </div>
  );
}
