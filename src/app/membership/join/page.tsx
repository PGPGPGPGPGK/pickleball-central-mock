"use client";
import { WithParams } from "@/components/demo/Params";
import { MembershipCheckout } from "@/components/membership/MembershipCheckout";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:px-6 md:pt-12">
      <WithParams render={(q) => <MembershipCheckout planId={q.get("plan") ?? "monthly"} />} />
    </div>
  );
}
