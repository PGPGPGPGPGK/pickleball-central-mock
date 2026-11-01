"use client";
import { WithParams } from "@/components/demo/Params";
import { CheckInFlow } from "@/components/session/CheckInFlow";

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:px-6 md:pt-12">
      <WithParams render={(q) => <CheckInFlow code={q.get("code")} />} />
    </div>
  );
}
