"use client";

/**
 * Who is paying — one block shared by every website checkout.
 *
 *   signed out      → mobile number → SMS code. That signs the customer into
 *                     THE account for that phone (the app's account), creating
 *                     it if new. Nothing is ever matched by an unverified detail.
 *   signed in       → name + email. An email is set only after its own code
 *                     proves it; one already on another account is refused and
 *                     flagged for staff, never merged.
 *   complete        → a one-line summary with Edit.
 *
 * Reports readiness up; the parent's Pay button stays disabled until ready.
 */
import { useEffect, useState, type ReactNode } from "react";

import {
  completeProfile,
  isCheckoutReady,
  isPlaceholderEmail,
  type Me,
  requestEmailCode,
  requestPhoneCode,
  restoreSession,
  signOut,
  verifyEmailCode,
  verifyPhoneCode,
} from "@/lib/auth";
import { isEmail, toE164 } from "@/lib/booking";
import { friendlyError } from "@/lib/friendly-error";

import { Icon } from "../site/Icon";

export function CustomerDetails({ onReady }: { onReady: (me: Me | null) => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let live = true;
    void restoreSession().then((m) => {
      if (!live) return;
      setMe(m);
      setRestoring(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const ready = isCheckoutReady(me) && !editing;
  useEffect(() => onReady(ready ? me : null), [ready, me, onReady]);

  if (restoring) {
    return <div className="h-[116px] animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" aria-label="Loading your details" />;
  }

  return (
    <section aria-labelledby="who" className="rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="who" className="text-sm font-semibold uppercase tracking-[0.08em] text-[#CBD5E1]">
          Your details
        </h2>
        {me && ready ? (
          <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-[#C8F400] hover:underline">
            Edit
          </button>
        ) : null}
      </div>

      {!me ? (
        <PhoneSignIn onSignedIn={setMe} />
      ) : ready ? (
        <div className="mt-3 text-[15px] text-white">
          <p className="font-medium">{me.full_name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-[#CBD5E1]">
            <Verified>{formatPhone(me.phone)}</Verified>
            <span aria-hidden="true">·</span>
            <Verified>{me.email}</Verified>
          </p>
          <p className="mt-2 text-xs text-[#94A3B8]">Receipts and confirmations go here. Same account as the app.</p>
        </div>
      ) : (
        <CompleteProfile
          me={me}
          onDone={(m) => {
            setMe(m);
            setEditing(false);
          }}
          onSignOut={async () => {
            await signOut();
            setMe(null);
            setEditing(false);
          }}
          editing={editing}
        />
      )}
    </section>
  );
}

export function PhoneSignIn({ onSignedIn }: { onSignedIn: (me: Me) => void }) {
  const [phone, setPhone] = useState("");
  const [reqId, setReqId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const e164 = toE164(phone);

  const send = async () => {
    if (!e164) return setError("Enter a 10-digit Indian mobile number.");
    setBusy(true);
    setError(null);
    try {
      setReqId((await requestPhoneCode(e164)).reqId);
    } catch (err) {
      setError(friendlyError(err, "Couldn't send the code. Please try again."));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    if (!e164 || !reqId) return;
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await verifyPhoneCode(e164, reqId, code.trim()));
    } catch (err) {
      setError(friendlyError(err, "That code didn't work. Check it and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="mt-3"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void (reqId ? confirm() : send());
      }}
    >
      <p className="text-sm text-[#CBD5E1]">
        Verify your mobile number. Already use the app? This is the same account, with the same bookings.
      </p>
      <Field id="co-phone" label="Mobile number" error={reqId ? null : error}>
        <div className="flex">
          <span className="grid place-items-center rounded-l-xl border border-r-0 border-white/15 bg-white/[0.04] px-3 text-[15px] text-[#CBD5E1]">+91</span>
          <input
            id="co-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="97007 44634"
            value={phone}
            disabled={Boolean(reqId)}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputCls} rounded-l-none`}
            aria-invalid={Boolean(error) && !reqId}
            aria-describedby="co-phone-err"
          />
        </div>
      </Field>
      {reqId ? (
        <>
          <Field id="co-code" label={`Code sent to ${formatPhone(e164)}`} error={error}>
            <input
              id="co-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputCls} tracking-[0.3em]`}
              aria-invalid={Boolean(error)}
              aria-describedby="co-code-err"
              autoFocus
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy || code.length < 4} className={primary}>
              {busy ? "Checking…" : "Verify"}
            </button>
            <button type="button" onClick={() => { setReqId(null); setCode(""); }} className="text-sm text-[#94A3B8] hover:text-white">
              Change number
            </button>
          </div>
        </>
      ) : (
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Sending…" : "Send code"}
        </button>
      )}
    </form>
  );
}

function CompleteProfile({
  me,
  editing,
  onDone,
  onSignOut,
}: {
  me: Me;
  editing: boolean;
  onDone: (me: Me) => void;
  onSignOut: () => void;
}) {
  const [name, setName] = useState(me.full_name === "Player" ? "" : me.full_name);
  const [email, setEmail] = useState(isPlaceholderEmail(me.email) ? "" : me.email);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailVerified = !isPlaceholderEmail(me.email) && email.trim().toLowerCase() === me.email;

  const save = async () => {
    setError(null);
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!isEmail(email)) return setError("Enter a valid email — your receipt goes here.");
    setBusy(true);
    try {
      if (!emailVerified) {
        if (!otpId) {
          const r = await requestEmailCode(email.trim());
          if (!r.unchanged) {
            setOtpId(r.otpId);
            setDevCode(r.devCode);
            return;
          }
        } else {
          await verifyEmailCode(otpId, code.trim());
        }
      }
      onDone(await completeProfile(name));
    } catch (err) {
      setError(friendlyError(err, "Couldn't save your details. Please try again."));
      if (otpId) setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="mt-3" noValidate onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <p className="flex flex-wrap items-center gap-x-2 text-sm text-[#CBD5E1]">
        <Verified>{formatPhone(me.phone)}</Verified>
        <button type="button" onClick={onSignOut} className="text-[#94A3B8] underline-offset-2 hover:text-white hover:underline">
          Not you?
        </button>
      </p>
      {!editing && !me.profile_completed ? (
        <p className="mt-2 text-sm text-[#CBD5E1]">Add your name and email to finish your profile. You only do this once.</p>
      ) : null}
      <Field id="co-name" label="Full name" error={null}>
        <input id="co-name" autoComplete="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field id="co-email" label="Email" error={otpId ? null : error}>
        <input
          id="co-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          disabled={Boolean(otpId)}
          maxLength={254}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          aria-invalid={Boolean(error) && !otpId}
          aria-describedby="co-email-err"
        />
      </Field>
      {otpId ? (
        <Field id="co-ecode" label={`Code sent to ${email.trim()}`} error={error}>
          <input
            id="co-ecode"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputCls} tracking-[0.3em]`}
            autoFocus
          />
          {devCode ? <p className="mt-1 font-mono text-[11px] text-amber-200">Local test code: {devCode}</p> : null}
        </Field>
      ) : null}
      <button type="submit" disabled={busy || (Boolean(otpId) && code.length < 6)} className={primary}>
        {busy ? "Saving…" : otpId ? "Verify email" : emailVerified ? "Save details" : "Verify email"}
      </button>
    </form>
  );
}

function Verified({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <Icon name="check" className="h-3.5 w-3.5 text-[#9BE8B0]" strokeWidth={3} />
      <span className="sr-only">(verified)</span>
    </span>
  );
}

export const formatPhone = (p: string | null | undefined) =>
  (p ?? "").replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");

const inputCls =
  "h-12 w-full rounded-xl border border-white/15 bg-[#0F1525] px-4 text-[16px] text-white placeholder:text-[#475569] outline-none transition-colors focus:border-[#C8F400] disabled:opacity-60 aria-[invalid=true]:border-[#FF7A8C]";
const primary =
  "mt-1 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0A0F1E] transition-colors hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-40";

function Field({ id, label, error, children }: { id: string; label: string; error: string | null; children: ReactNode }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white">
        {label}
      </label>
      {children}
      <p id={`${id}-err`} role={error ? "alert" : undefined} className="mt-1.5 min-h-[1rem] text-xs text-[#FF9AA8]">
        {error ?? ""}
      </p>
    </div>
  );
}
