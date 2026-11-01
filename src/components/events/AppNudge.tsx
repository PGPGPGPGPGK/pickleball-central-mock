/**
 * After a successful website registration: the entry is already on the
 * account for this phone (public registration links by phone), so the app
 * shows it once they sign in with the same number.
 */
import { STORES } from "@/lib/site";

export function AppNudge({ phone }: { phone?: string }) {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <p className="font-semibold text-white">Keep track in the app</p>
      <p className="mt-1 text-sm text-grey-300">
        Sign in with {phone ? <strong className="text-white">{phone}</strong> : "the same phone number"} to see this entry
        and your tournaments in one place.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={STORES.android} className="rounded-full bg-[#C8F400] px-4 py-2 font-semibold text-[#0A0F1E]">Google Play</a>
        <a href={STORES.ios} className="rounded-full border border-white/15 px-4 py-2 text-white">App Store</a>
      </div>
    </div>
  );
}
