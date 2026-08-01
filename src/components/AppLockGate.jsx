import { useState, useEffect } from "react";
import { hasPinSet, verifyPin } from "../utils/appLock";

// App khulte hi (fresh cold-start) agar user ne PIN lock laga rakha hai, to pehle
// PIN maangta hai. Ek baar sahi PIN dalne ke baad, us session (jab tak app band na
// ho) ke liye phir nahi poochta.
export default function AppLockGate({ children }) {
  const [locked, setLocked] = useState(hasPinSet());
  const [pin, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleDigit = async (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPinInput(next);
    if (next.length === 4) {
      const ok = await verifyPin(next);
      if (ok) {
        setLocked(false);
      } else {
        setError("Galat PIN, dobara try karo");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setPinInput("");
      }
    }
  };

  if (!locked) return children;

  return (
    <div style={styles.wrap}>
      <div className="wordmark" style={{ fontSize: 26, marginBottom: 6 }}>
        Chat<span className="dot">.</span>
      </div>
      <div style={styles.sub}>App lock laga hai - PIN daalo</div>

      <div style={{ ...styles.dots, ...(shake ? { animation: "shakeX 0.4s" } : {}) }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ ...styles.dot, ...(i < pin.length ? styles.dotFilled : {}) }} />
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.pad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              style={styles.key}
              onClick={() => {
                if (k === "⌫") setPinInput((p) => p.slice(0, -1));
                else handleDigit(k);
              }}
            >
              {k}
            </button>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    gap: 6,
  },
  sub: { color: "var(--text-muted)", fontSize: 13.5, marginBottom: 24 },
  dots: { display: "flex", gap: 14, marginBottom: 18 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid var(--border)",
  },
  dotFilled: { background: "var(--accent)", borderColor: "var(--accent)" },
  error: { color: "var(--danger)", fontSize: 12.5, marginBottom: 10 },
  pad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 64px)",
    gap: 14,
    marginTop: 16,
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 20,
    fontWeight: 600,
  },
};
