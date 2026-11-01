"use client";
import { CoachingCheckout } from "@/components/coaching/CoachingCheckout";
import { WithParams } from "@/components/demo/Params";

export default function CoachingJoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:px-6 md:pt-12">
      <WithParams render={(q) => <CoachingCheckout planId={q.get("plan") ?? ""} />} />
    </div>
  );
}
