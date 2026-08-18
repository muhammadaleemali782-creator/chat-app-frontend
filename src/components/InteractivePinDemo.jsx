import { useState } from "react";

export default function InteractivePinDemo() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [portalVortex, setPortalVortex] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleKeyPress = (num) => {
    if (portalVortex || unlocked) return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === "1234") {
          // Correct PIN: Holographic Laser Unlock
          setStatusMessage("DECRYPTING VAULT...");
          setTimeout(() => {
            setUnlocked(true);
            setStatusMessage("");
          }, 350);
        } else {
          // Wrong PIN: Cosmic Black Hole Portal Collapse!
          setPortalVortex(true);
          setStatusMessage("⚠️ BREACH DETECTED: OPENING VOID PORTAL...");
          setTimeout(() => {
            setPin("");
            setPortalVortex(false);
            setStatusMessage("🔒 VAULT RESTABILIZED (Try correct PIN: 1234)");
            setTimeout(() => setStatusMessage(""), 3500);
          }, 2800);
        }
      }
    }
  };

  const handleClear = () => {
    setPin("");
    setUnlocked(false);
    setPortalVortex(false);
    setStatusMessage("");
  };

  return (
    <div className="pin-demo-shell">
      {/* Header */}
      <div className="pin-demo-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>3D Interactive PIN & Security Gate</span>
        </div>
        <span
          style={{
            fontSize: 11,
            background: unlocked
              ? "rgba(16, 185, 129, 0.2)"
              : portalVortex
              ? "rgba(239, 68, 68, 0.25)"
              : "rgba(37, 99, 235, 0.15)",
            color: unlocked ? "#10b981" : portalVortex ? "#ef4444" : "var(--accent)",
            padding: "4px 9px",
            borderRadius: 8,
            fontWeight: 800,
            letterSpacing: "0.03em"
          }}
        >
          {unlocked ? "🔓 UNLOCKED" : portalVortex ? "🌀 VOID PURGE" : "🔒 LOCKED"}
        </span>
      </div>

      <div className="pin-demo-body" style={{ position: "relative", minHeight: 330, overflow: "hidden" }}>
        {/* 1. COSMIC BLACK HOLE PORTAL COLLAPSE (WRONG PIN) */}
        {portalVortex && (
          <div className="cosmic-portal-overlay">
            {/* Dimensional Event Horizon Rings */}
            <div className="portal-singularity">
              <div className="portal-ring ring-1" />
              <div className="portal-ring ring-2" />
              <div className="portal-ring ring-3" />
              <div className="portal-core" />
              <div className="portal-lightning" />
            </div>

            {/* Sucking Void Particles */}
            <div className="void-particles-stream">
              {[...Array(12)].map((_, i) => (
                <span key={i} className={`void-particle p-${i + 1}`} />
              ))}
            </div>

            {/* Glitch Warning HUD */}
            <div className="portal-hud-warning">
              <div className="portal-hud-badge">⚠️ SECURITY VOID ACTIVATED</div>
              <h4 className="portal-hud-title">PURGING THREAT TO SINGULARITY</h4>
              <p className="portal-hud-desc">
                Unauthorized PIN attempt detected. Erasing temporary cache and collapsing memory dimensional vectors into the void...
              </p>
            </div>
          </div>
        )}

        {/* 2. UNLOCKED CELEBRATION VIEW (CORRECT PIN: 1234) */}
        {unlocked ? (
          <div className="pin-unlocked-view">
            <div className="holographic-laser-scan" />
            <div className="pin-success-icon-wrap">
              <span className="pin-success-icon">🔓</span>
              <div className="success-pulse-ring" />
            </div>
            <h4 style={{ margin: "14px 0 6px", fontSize: 17, fontWeight: 800, color: "#10b981" }}>
              Vault Decrypted & Unlocked!
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 280, margin: "0 auto 18px", lineHeight: 1.5 }}>
              Your encrypted direct chats, WebRTC video rooms, and smart sheets are ready.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                className="btn-primary-glow"
                style={{ fontSize: 12.5, padding: "8px 18px", borderRadius: 10 }}
                onClick={handleClear}
              >
                Re-Lock Vault 🔒
              </button>
            </div>
          </div>
        ) : (
          /* 3. NORMAL 3D KEYPAD VIEW */
          <div className={`pin-keypad-view ${portalVortex ? "keypad-vortex-imploding" : ""}`}>
            <div className="pin-guide-banner">
              <span>Try Correct: <strong style={{ color: "#10b981" }}>1 2 3 4</strong></span>
              <span style={{ margin: "0 6px" }}>•</span>
              <span>Try Wrong: <strong style={{ color: "#ef4444" }}>9 9 9 9</strong> (triggers void portal!)</span>
            </div>

            {statusMessage && (
              <div className="pin-status-banner">
                {statusMessage}
              </div>
            )}

            {/* PIN Indicator Dots */}
            <div className="pin-dots-row">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`pin-dot ${pin.length > idx ? "filled" : ""}`}
                />
              ))}
            </div>

            {/* 3D Tactile Keypad */}
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
                title="Clear input"
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
                title="Backspace"
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
