"use client";

/**
 * Review & checkout details (owner decision 2026-11-01): name, mobile, email
 * on one compact block, then Razorpay prefilled with them.
 *
 *   - The MOBILE is the identity: verified by SMS code, which signs the
 *     customer into the one account for that number (the app's account).
 *   - The EMAIL is cross-checked, not code-verified: the API sets it only if
 *     no other account holds it; a clash is refused, never merged.
 *   - The name is for the booking and receipt.
 */
import { useCallback, useEffect, useState } from "react";

import { authFetch, isCheckoutReady, isPlaceholderEmail, type Me, refreshMe, requestPhoneCode, restoreSession, signOut, verifyPhoneCode } from "@/lib/auth";
import { isEmail, toE164 } from "@/lib/booking";
import { friendlyError } from "@/lib/friendly-error";

import { Icon } from "../site/Icon";
import { formatPhone } from "./CustomerDetails";

export function ContactDetails({ onReady }: { onReady: (me: Me | null) => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reqId, setReqId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adopt = useCallback((m: Me | null) => {
    setMe(m);
    if (m) {
      setName(m.full_name === "Player" ? "" : m.full_name);
      setPhone((m.phone ?? "").replace(/^\+91/, ""));
      setEmail(isPlaceholderEmail(m.email) ? "" : m.email);
    }
  }, []);

  useEffect(() => {
    void restoreSession().then((m) => {
      adopt(m);
      setRestoring(false);
    });
  }, [adopt]);

  const ready = isCheckoutReady(me) && !editing;
  useEffect(() => onReady(ready ? me : null), [ready, me, onReady]);

  const e164 = toE164(phone);
  const phoneVerified = Boolean(me?.phone && e164 === me.phone);

  const saveContact = async () => {
    await authFetch("/v1/users/me/contact", {
      method: "POST",
      body: JSON.stringify({ full_name: name.trim(), email: email.trim() }),
    });
    adopt(await refreshMe());
    setEditing(false);
  };

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError("Enter your name.");
    if (!e164) return setError("Enter a 10-digit Indian mobile number.");
    if (!isEmail(email)) return setError("Enter a valid email — your receipt goes here.");
    setBusy(true);
    try {
      if (!phoneVerified) {
        if (me) await signOut(); // a different number = a different account
        if (!reqId) {
          setReqId((await requestPhoneCode(e164)).reqId);
          return;
        }
        await verifyPhoneCode(e164, reqId, code.trim());
        setReqId(null);
        setCode("");
      }
      await saveContact();
    } catch (err) {
      setError(friendlyError(err, "Couldn't confirm your details. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (restoring) return <div className="h-14 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" aria-label="Loading your details" />;

  if (ready && me) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
        <p className="min-w-0 text-sm text-white">
          <span className="font-medium">{me.full_name}</span>
          <span className="text-[#CBD5E1]">
            {" · "}
            {formatPhone(me.phone)} <Icon name="check" className="inline h-3.5 w-3.5 text-[#9BE8B0]" strokeWidth={3} />
            <span className="sr-only">(verified)</span>
            {" · "}
            <span className="break-all">{me.email}</span>
          </span>
        </p>
        <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-sm font-medium text-[#C8F400] hover:underline">
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="rounded-2xl border border-white/10 bg-[#111827] p-4"
      aria-labelledby="contact-h"
    >
      <h2 id="contact-h" className="text-sm font-semibold text-white">
        Your details
      </h2>
      <p className="mt-0.5 text-xs text-[#94A3B8]">We text a code to confirm your number. When you tap Pay, the court is held for you for 5 minutes.</p>
      <div className="mt-3 grid gap-2.5">
        <input aria-label="Full name" placeholder="Full name" autoComplete="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} className={inputCls} />
        <div className="flex">
          <span className="grid place-items-center rounded-l-xl border border-r-0 border-white/15 bg-white/[0.04] px-3 text-[15px] text-[#CBD5E1]">+91</span>
          <input
            aria-label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Mobile number"
            value={phone}
            disabled={Boolean(reqId)}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputCls} rounded-l-none`}
          />
        </div>
        <input aria-label="Email" type="email" inputMode="email" autoComplete="email" placeholder="Email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        {reqId ? (
          <div>
            <input
              aria-label={`Code sent to ${formatPhone(e164)}`}
              placeholder={`Code sent to ${formatPhone(e164)}`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputCls} tracking-[0.3em]`}
              autoFocus
            />
            <button type="button" onClick={() => { setReqId(null); setCode(""); }} className="mt-1 text-xs text-[#94A3B8] hover:text-white">
              Change number
            </button>
          </div>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-[#FF9AA8]">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || (Boolean(reqId) && code.length < 4)}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0A0F1E] hover:bg-[#E2E8F0] disabled:opacity-40"
      >
        {busy ? "Checking…" : reqId ? "Verify & continue" : phoneVerified ? "Save details" : "Send code"}
      </button>
    </form>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-white/15 bg-[#0F1525] px-4 text-[16px] text-white placeholder:text-[#64748B] outline-none transition-colors focus:border-[#C8F400] disabled:opacity-60";
