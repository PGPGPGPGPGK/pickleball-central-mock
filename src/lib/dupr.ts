/**
 * DUPR ID normalisation + sanity checking — the browser-side mirror of
 * `apps/api/src/lib/dupr.ts`.
 *
 * The API is the authority: it rejects a missing or implausible DUPR ID on
 * every DUPR-rated entry. This copy exists so the player is told at the form
 * step rather than after they have opened Razorpay. Keep the two in sync —
 * if a rule changes here it must change there, and vice versa.
 */

/** Filler people type to get past a required field. Compared post-normalise. */
const PLACEHOLDER_IDS = new Set([
  "NA",
  "NIL",
  "NONE",
  "NOTAVAILABLE",
  "NOTAPPLICABLE",
  "NOID",
  "NODUPR",
  "NOTYET",
  "DUPR",
  "DUPRID",
  "ID",
  "YES",
  "NO",
  "TEST",
  "TESTING",
  "DEMO",
  "SAMPLE",
  "ASDF",
  "ASDFGH",
  "QWERTY",
  "ABCD",
  "ABCDE",
  "ABCDEF",
  "ABC123",
  "XYZ123",
  "123456",
  "1234",
  "12345",
  "1234567",
  "12345678",
  "0000",
  "00000",
  "000000",
  "1111",
  "11111",
  "111111",
]);

/**
 * Canonical form: trimmed, upper-cased, punctuation stripped. "" when unusable.
 * INTERNAL whitespace is kept on purpose — see the API copy: collapsing it
 * would let a typed-in name pass as an ID.
 */
export function normalizeDuprId(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .trim()
    .toUpperCase()
    .replace(/[-_.#/]/g, "");
}

function isSingleCharacter(id: string): boolean {
  return id.length > 0 && new Set(id).size === 1;
}

/** True when `id` (already normalised) could be a DUPR ID. */
export function isPlausibleDuprId(id: string): boolean {
  if (!/^[A-Z0-9]{4,12}$/.test(id)) return false;
  if (PLACEHOLDER_IDS.has(id)) return false;
  if (isSingleCharacter(id)) return false;
  return true;
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** A DUPR ID that is just the player's phone number is filler, not an ID. */
export function duprIdIsPhone(id: string, phone: string): boolean {
  const idDigits = digitsOnly(id);
  const phoneDigits = digitsOnly(phone);
  if (idDigits.length < 7 || idDigits !== id) return false;
  return phoneDigits.endsWith(idDigits) || idDigits.endsWith(phoneDigits);
}

/**
 * A DUPR ID that is the player's own name is filler too. A multi-word name is
 * already rejected (it keeps its space), so this catches the single-word case.
 */
export function duprIdIsName(id: string, fullName: string): boolean {
  const name = fullName.trim().toUpperCase();
  if (name === "") return false;
  if (id === name.replace(/[^A-Z0-9]/g, "")) return true;
  return name.split(/\s+/).some((part) => part.replace(/[^A-Z0-9]/g, "") === id);
}

/**
 * Validate a player's DUPR ID for a DUPR-rated entry. Returns a message ready
 * to show, or null when the ID is acceptable.
 *
 * `who` names the player for a form-level error ("Player 2"). Pass "" for the
 * message shown directly under the field, where naming the player again would
 * just be noise.
 */
export function duprIdError(
  rawId: string,
  phone: string,
  fullName: string,
  who: string,
): string | null {
  const whose = who === "" ? "" : `${who}'s `;
  const id = normalizeDuprId(rawId);
  if (id === "") {
    return who === ""
      ? "A DUPR ID is mandatory for every player."
      : `Enter ${who}'s DUPR ID — it's mandatory for every player.`;
  }
  if (!isPlausibleDuprId(id)) {
    return `${whose}DUPR ID doesn't look right. Copy it from your DUPR profile (4–12 letters/numbers).`;
  }
  if (duprIdIsPhone(id, phone)) {
    return `${whose}DUPR ID can't be a phone number — copy it from your DUPR profile.`;
  }
  if (duprIdIsName(id, fullName)) {
    return `${whose}DUPR ID can't be a name — copy it from your DUPR profile.`;
  }
  return null;
}
