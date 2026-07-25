/**
 * Fallback initial for daily-price items with no emoji set (e.g. ねぎ,
 * アスパラ — common vegetables with no dedicated Unicode emoji).
 * Array.from splits by Unicode code point rather than UTF-16 code unit,
 * so multi-byte Japanese characters come through intact instead of a
 * mangled half-character.
 */
export function nameInitial(name) {
  if (!name) return "・";
  const seg = Array.from(name.trim())[0];
  return seg || "・";
}
