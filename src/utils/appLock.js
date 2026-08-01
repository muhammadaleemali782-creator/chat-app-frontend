// App-lock PIN - poori tarah device ke andar hi rehta hai (localStorage), kabhi
// server pe nahi jaata. Optional feature - user chahe to laga sakta hai, chahe na kare.

const KEY = "appLockPinHash";

async function hashPin(pin) {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hasPinSet() {
  return !!localStorage.getItem(KEY);
}

export async function setPin(pin) {
  const hash = await hashPin(pin);
  localStorage.setItem(KEY, hash);
}

export function clearPin() {
  localStorage.removeItem(KEY);
}

export async function verifyPin(pin) {
  const saved = localStorage.getItem(KEY);
  if (!saved) return true; // pin lagaya hi nahi hai to hamesha allow
  const hash = await hashPin(pin);
  return hash === saved;
}
