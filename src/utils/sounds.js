// Web Audio API se seedha sound generate karte hain - koi mp3/audio file download
// nahi karni padti, isliye app halka rehta hai (2GB RAM phones ke liye zaroori).

let audioCtx = null;
const getCtx = () => {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  // Mobile browsers/WebView kabhi kabhi audio context ko "suspended" rakhte hain
  // jab tak user interact na kare - isliye resume try karte hain
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
};

function beep(freq, startTime, duration, volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// Chhota, halka "ting" - naya message aane par
export function playNotificationSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    beep(880, now, 0.12, 0.12);
    beep(1180, now + 0.09, 0.14, 0.1);
  } catch (err) {
    // Audio na chale to bhi app crash nahi honi chahiye
  }
}

// Incoming call ringtone - do sur, loop hota rehta hai jab tak band na karo
let ringInterval = null;
export function startRingtone() {
  try {
    stopRingtone();
    const ring = () => {
      const ctx = getCtx();
      const now = ctx.currentTime;
      beep(740, now, 0.35, 0.16);
      beep(950, now + 0.4, 0.35, 0.16);
    };
    ring();
    ringInterval = setInterval(ring, 1500);
  } catch (err) {
    // ignore
  }
}
export function stopRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}

// Outgoing call - "trrring... trrring" jaisa lamba beep loop
let outgoingInterval = null;
export function startOutgoingTone() {
  try {
    stopOutgoingTone();
    const tone = () => {
      const ctx = getCtx();
      const now = ctx.currentTime;
      beep(480, now, 1.0, 0.08);
    };
    tone();
    outgoingInterval = setInterval(tone, 2000);
  } catch (err) {
    // ignore
  }
}
export function stopOutgoingTone() {
  if (outgoingInterval) {
    clearInterval(outgoingInterval);
    outgoingInterval = null;
  }
}
