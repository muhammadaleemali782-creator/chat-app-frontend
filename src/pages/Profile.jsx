import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import { hasPinSet, setPin, clearPin, verifyPin } from "../utils/appLock";

const APP_SHARE_URL = "https://chat-app-frontend-iota-coral.vercel.app";

export default function Profile({ onClose }) {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pinMode, setPinMode] = useState(null); // null | "set" | "remove"
  const [pinStep, setPinStep] = useState(1); // 1 = enter, 2 = confirm
  const [pinValue, setPinValue] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [lockEnabled, setLockEnabled] = useState(hasPinSet());

  const color = avatarColor(user?.displayName || "");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const handleShareApp = async () => {
    const shareText = `${user?.displayName} (@${user?.username}) ne aapko Chatox use karne ke liye invite kiya hai!\n\n${APP_SHARE_URL}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Chatox",
          text: shareText,
          url: APP_SHARE_URL,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Link copy ho gaya - kisi ko bhi paste karke bhej do!");
      }
    } catch (err) {
      // User cancelled
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/me", { displayName, bio });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const startEnableLock = () => {
    setPinMode("set");
    setPinStep(1);
    setPinValue("");
    setPinConfirm("");
    setPinError("");
  };

  const startDisableLock = () => {
    setPinMode("remove");
    setPinStep(1);
    setPinValue("");
    setPinError("");
  };

  const handlePinDigit = async (d) => {
    if (pinMode === "remove") {
      if (pinValue.length >= 4) return;
      const next = pinValue + d;
      setPinValue(next);
      if (next.length === 4) {
        const ok = await verifyPin(next);
        if (ok) {
          clearPin();
          setLockEnabled(false);
          setPinMode(null);
        } else {
          setPinError("Galat PIN");
          setPinValue("");
        }
      }
      return;
    }

    if (pinStep === 1) {
      if (pinValue.length >= 4) return;
      const next = pinValue + d;
      setPinValue(next);
      if (next.length === 4) {
        setPinStep(2);
      }
    } else {
      if (pinConfirm.length >= 4) return;
      const next = pinConfirm + d;
      setPinConfirm(next);
      if (next.length === 4) {
        if (next === pinValue) {
          await setPin(next);
          setLockEnabled(true);
          setPinMode(null);
        } else {
          setPinError("PIN match nahi hua, dobara try karo");
          setPinStep(1);
          setPinValue("");
          setPinConfirm("");
        }
      }
    }
  };

  const currentPinDisplay = pinMode === "remove" ? pinValue : pinStep === 1 ? pinValue : pinConfirm;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Close Profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Profile Avatar (Perfect 1:1 Circle) */}
        <div style={{ ...styles.avatar, background: color.bg, color: color.fg }}>
          {initial}
        </div>
        <div style={styles.username}>@{user?.username}</div>

        {/* Form Inputs */}
        <label style={styles.label}>Naam</label>
        <input
          style={styles.input}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <label style={styles.label}>Bio (140 characters tak)</label>
        <textarea
          style={styles.textarea}
          value={bio}
          maxLength={140}
          placeholder="Apne baare mein kuch likho..."
          onChange={(e) => setBio(e.target.value)}
        />
        <div style={styles.charCount}>{bio.length}/140</div>

        <button
          type="button"
          className="primary-btn"
          style={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Save ho raha hai..." : saved ? "✓ Save ho gaya" : "Save karo"}
        </button>

        <button type="button" style={styles.shareBtn} onClick={handleShareApp}>
          🔗 App Share Karo
        </button>

        <div style={styles.divider} />

        {/* Biometric / PIN Lock Section */}
        <div style={styles.lockSection}>
          <div style={{ flex: 1 }}>
            <div style={styles.lockTitle}>🔒 App Lock (PIN Gate)</div>
            <div style={styles.lockSub}>
              {lockEnabled
                ? "Chalu hai - app kholte hi PIN maangega"
                : "Band hai - privacy ke liye 4-digit PIN lock lagao"}
            </div>
          </div>
          {!pinMode && (
            <button
              type="button"
              style={{ ...styles.lockToggleBtn, ...(lockEnabled ? styles.lockToggleOn : {}) }}
              onClick={lockEnabled ? startDisableLock : startEnableLock}
            >
              {lockEnabled ? "Hatao" : "Lagao"}
            </button>
          )}
        </div>

        {pinMode && (
          <div style={styles.pinSetupWrap}>
            <div style={styles.pinSetupLabel}>
              {pinMode === "remove"
                ? "PIN hatane ke liye current PIN daalo"
                : pinStep === 1
                ? "Naya 4-digit PIN banao"
                : "PIN dobara confirm karo"}
            </div>
            <div style={styles.dots}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{ ...styles.dot, ...(i < currentPinDisplay.length ? styles.dotFilled : {}) }}
                />
              ))}
            </div>
            {pinError && <div style={styles.pinError}>{pinError}</div>}
            <div style={styles.pinPad}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
                k === "" ? (
                  <div key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    style={styles.pinKey}
                    onClick={() => {
                      if (k === "⌫") {
                        if (pinMode === "remove") setPinValue((p) => p.slice(0, -1));
                        else if (pinStep === 1) setPinValue((p) => p.slice(0, -1));
                        else setPinConfirm((p) => p.slice(0, -1));
                      } else {
                        handlePinDigit(k);
                      }
                    }}
                  >
                    {k}
                  </button>
                )
              )}
            </div>
            <button type="button" style={styles.cancelPinBtn} onClick={() => setPinMode(null)}>
              Cancel karo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    boxShadow: "var(--shadow)",
    padding: "32px 24px 24px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    borderRadius: 10,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  avatar: {
    width: 76,
    height: 76,
    minWidth: 76,
    minHeight: 76,
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    marginBottom: 8,
    flexShrink: 0,
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  },
  username: { color: "var(--text-muted)", fontSize: 13.5, marginBottom: 18, fontWeight: 600 },
  label: {
    alignSelf: "flex-start",
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 13.5,
    minHeight: 72,
    resize: "none",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: "var(--text-faint)",
    marginTop: 4,
  },
  saveBtn: {
    marginTop: 18,
    width: "100%",
    background: "var(--accent)",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px var(--accent-glow)",
  },
  shareBtn: {
    marginTop: 10,
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  divider: {
    width: "100%",
    height: 1,
    background: "var(--border-soft)",
    margin: "20px 0 16px",
  },
  lockSection: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  lockTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--text)" },
  lockSub: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 },
  lockToggleBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
    cursor: "pointer",
  },
  lockToggleOn: { background: "var(--danger)", color: "#ffffff", borderColor: "var(--danger)" },
  pinSetupWrap: {
    width: "100%",
    marginTop: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pinSetupLabel: { fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12 },
  dots: { display: "flex", gap: 10, marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--border)" },
  dotFilled: { background: "var(--accent)", borderColor: "var(--accent)" },
  pinError: { color: "var(--danger)", fontSize: 12, marginBottom: 8 },
  pinPad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 50px)",
    gap: 10,
    marginTop: 6,
  },
  pinKey: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text)",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelPinBtn: {
    marginTop: 14,
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12.5,
    textDecoration: "underline",
    cursor: "pointer",
  },
};
