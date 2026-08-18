import { useState } from "react";

export default function InteractivePinDemo() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === "1234" || nextPin.length === 4) {
          setTimeout(() => setUnlocked(true), 250);
        } else {
          setErrorShake(true);
          setTimeout(() => {
            setPin("");
            setErrorShake(false);
          }, 600);
        }
      }
    }
  };

  const handleClear = () => {
    setPin("");
    setUnlocked(false);
  };

  return (
    <div className="pin-demo-shell">
      <div className="pin-demo-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>Interactive PIN Gate Simulator</span>
        </div>
        <span style={{ fontSize: 11, background: unlocked ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)", color: unlocked ? "#10b981" : "var(--accent)", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
          {unlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <div className="pin-demo-body">
        {unlocked ? (
          <div className="pin-unlocked-view">
            <div className="pin-success-icon">🔓</div>
            <h4 style={{ margin: "10px 0 6px", fontSize: 16, fontWeight: 800 }}>Vault Unlocked!</h4>
            <p style={{ color: "var(--text-muted)", fontSize: 12.5, maxWidth: 260, margin: "0 auto 16px" }}>
              Your private chats, encryption keys, and smart sheets are now accessible.
            </p>
            <button
              type="button"
              className="btn-primary-glow"
              style={{ fontSize: 12.5, padding: "8px 18px", borderRadius: 10 }}
              onClick={handleClear}
            >
              Re-Lock Vault 🔒
            </button>
          </div>
        ) : (
          <div className="pin-keypad-view">
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px", textAlign: "center" }}>
              Enter any 4-digit PIN (Try: <strong>1 2 3 4</strong>)
            </p>

            {/* PIN Dots */}
            <div className={`pin-dots-row ${errorShake ? "shake" : ""}`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`pin-dot ${pin.length > idx ? "filled" : ""}`}
                />
              ))}
            </div>

            {/* 3D Keypad Grid */}
            <div className="pin-keys-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="pin-key-btn"
                  onClick={() => handleKeyPress(n.toString())}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="pin-key-btn pin-key-fn"
                onClick={handleClear}
              >
                C
              </button>
              <button
                type="button"
                className="pin-key-btn"
                onClick={() => handleKeyPress("0")}
              >
                0
              </button>
              <button
                type="button"
                className="pin-key-btn pin-key-fn"
                onClick={() => setPin(pin.slice(0, -1))}
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
