"use client";

/**
 * Website customer session — the same accounts, tokens and rules as the app.
 *
 * Sign-in is phone-first SMS OTP (`/v1/auth/otp/sms/{request,verify}`), so a
 * website customer IS their app account: same user id, same history. The
 * access token lives in memory + this tab's sessionStorage; the refresh token
 * is the API's HttpOnly `pc_refresh` cookie (SameSite=Lax — the marketing site
 * and api.* are same-site), so it never touches JavaScript.
 */
import { ApiHttpError, demoCall, PREVIEW_MOCKS } from "./api";
import { DEMO } from "./demo";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
const STORE_KEY = "pc_session";

export type Me = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  profile_completed: boolean;
};

type Session = { token: string; expiresAt: number; me: Me | null };

let session: Session | null = null;
const listeners = new Set<() => void>();

function load(): Session | null {
  if (session) return session;
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    session = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    session = null;
  }
  return session;
}

function save(next: Session | null): void {
  session = next;
  try {
    if (next) sessionStorage.setItem(STORE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(STORE_KEY);
  } catch {
    // Private mode etc. — the in-memory session still works for this page.
  }
  listeners.forEach((l) => l());
}

export function onSessionChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const currentMe = (): Me | null => load()?.me ?? null;

/** Synthesised by phone sign-up / walk-ins — never a real inbox. */
export const isPlaceholderEmail = (email: string | null | undefined): boolean =>
  !email || /@(phone|no-email)\.pickleball-central\.co\.in$/i.test(email);

/** A customer who can pay: verified phone (signed in), real email, a name, profile flag set. */
export const isCheckoutReady = (me: Me | null): boolean =>
  Boolean(me && me.phone && !isPlaceholderEmail(me.email) && me.full_name.trim() && me.full_name !== "Player" && me.profile_completed);

async function raw<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  if (PREVIEW_MOCKS && method !== "GET") {
    throw new ApiHttpError({
      status: 0,
      code: "preview_mode",
      detail: "Read-only preview — sign-in and payments run against the local API only.",
    });
  }
  if (DEMO) {
    return demoCall<T>(path, {
      ...init,
      headers: init.token ? { authorization: `Bearer ${init.token}` } : {},
    });
  }
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  if (method !== "GET") headers.set("idempotency-key", headers.get("idempotency-key") ?? crypto.randomUUID());
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    let body: { code?: string; detail?: string; meta?: Record<string, unknown> } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // non-JSON error
    }
    throw new ApiHttpError({
      status: res.status,
      code: body.code ?? "unknown",
      detail: body.detail ?? res.statusText,
      ...(body.meta ? { meta: body.meta } : {}),
    });
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

type Tokens = { access_token: string; expires_in: number; user: Me };

function adopt(t: Tokens): Me {
  save({ token: t.access_token, expiresAt: Date.now() + (t.expires_in - 30) * 1000, me: t.user });
  return t.user;
}

/** Step 1 of sign-in: text a code to the phone (E.164). */
export async function requestPhoneCode(phone: string): Promise<{ reqId: string }> {
  const r = await raw<{ req_id: string }>("/v1/auth/otp/sms/request", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  return { reqId: r.req_id };
}

/** Step 2: verify the code → signed in as that phone's one account (created if new). */
export async function verifyPhoneCode(phone: string, reqId: string, code: string): Promise<Me> {
  const t = await raw<Tokens>("/v1/auth/otp/sms/verify", {
    method: "POST",
    body: JSON.stringify({ phone, req_id: reqId, code }),
  });
  adopt(t);
  return refreshMe();
}

/** New access token from the HttpOnly refresh cookie; null when signed out. */
async function refreshToken(): Promise<string | null> {
  try {
    const t = await raw<Tokens>("/v1/auth/refresh", { method: "POST", body: "{}" });
    return adopt(t) ? t.access_token : null;
  } catch {
    save(null);
    return null;
  }
}

async function token(): Promise<string | null> {
  const s = load();
  if (s && s.expiresAt > Date.now()) return s.token;
  return refreshToken();
}

/** Authenticated call; one silent refresh on 401. */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = await token();
  if (!t) throw new ApiHttpError({ status: 401, code: "signed_out", detail: "Please sign in again." });
  try {
    return await raw<T>(path, { ...init, token: t });
  } catch (err) {
    if (err instanceof ApiHttpError && err.status === 401) {
      const again = await refreshToken();
      if (again) return raw<T>(path, { ...init, token: again });
    }
    throw err;
  }
}

/** Re-read the profile (phone, email, name) after any change. */
export async function refreshMe(): Promise<Me> {
  const me = await authFetch<Me>("/v1/users/me");
  const s = load();
  if (s) save({ ...s, me });
  return me;
}

/** Restore a session on page load (cookie refresh); null if signed out. */
export async function restoreSession(): Promise<Me | null> {
  const s = load();
  if (s?.me && s.expiresAt > Date.now()) return s.me;
  const t = await refreshToken();
  return t ? refreshMe().catch(() => null) : null;
}

export async function signOut(): Promise<void> {
  try {
    const t = load()?.token;
    await raw("/v1/auth/logout", { method: "POST", body: "{}", ...(t ? { token: t } : {}) });
  } catch {
    // Signing out locally is what matters.
  }
  save(null);
}

/** Verified email: send a code, then confirm it. */
export async function requestEmailCode(email: string): Promise<{ otpId: string | null; devCode?: string; unchanged: boolean }> {
  const r = await authFetch<{ status: string; otp_id?: string; dev_code?: string }>("/v1/users/me/email/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return { otpId: r.otp_id ?? null, ...(r.dev_code ? { devCode: r.dev_code } : {}), unchanged: r.status === "unchanged" };
}

export async function verifyEmailCode(otpId: string, code: string): Promise<Me> {
  await authFetch("/v1/users/me/email/verify", { method: "POST", body: JSON.stringify({ otp_id: otpId, code }) });
  return refreshMe();
}

/** Name + the profile flag the booking gate checks. */
export async function completeProfile(fullName: string): Promise<Me> {
  await authFetch("/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify({ full_name: fullName.trim(), profile_completed: true }),
  });
  return refreshMe();
}
