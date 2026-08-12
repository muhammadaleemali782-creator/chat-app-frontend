import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import { hasPinSet, setPin, clearPin, verifyPin } from "../utils/appLock";

// Yeh aapki website ka link hai - jab koi app share karega, yehi link jaayega.
// Agar kabhi Vercel URL badal jaaye to bas yahan update kar dena.
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
    const shareText = `${user?.displayName} (@${user?.username}) ne aapko ChatApp use karne ke liye invite kiya hai!\n\n${APP_SHARE_URL}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ChatApp",
          text: shareText,
          url: APP_SHARE_URL,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Link copy ho gaya - kisi ko bhi paste karke bhej do!");
      }
    } catch (err) {
      // User ne share cancel kar diya ho sakta hai - kuch nahi karna
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

    // set mode
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
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div style={{ ...styles.avatar, background: color.bg, color: color.fg }}>{initial}</div>
        <div style={styles.username}>@{user?.username}</div>

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

        <button className="primary-btn" style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "Save ho raha hai..." : saved ? "✓ Save ho gaya" : "Save karo"}
        </button>

        <button style={styles.shareBtn} onClick={handleShareApp}>
          🔗 App Share Karo
        </button>

        <div style={styles.divider} />

        <div style={styles.lockSection}>
          <div style={{ flex: 1 }}>
            <div style={styles.lockTitle}>🔒 App Lock (PIN)</div>
            <div style={styles.lockSub}>
              {lockEnabled
                ? "Chalu hai - app kholte hi PIN maangega"
                : "Band hai - chahe to laga sakte ho, na chaho to koi zaroorat nahi"}
            </div>
          </div>
          {!pinMode && (
            <button
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
            <button style={styles.cancelPinBtn} onClick={() => setPinMode(null)}>
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
    background: "rgba(6,8,14,0.6)",
    zIndex: 500,
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
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow-soft)",
    padding: "32px 24px 24px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    borderRadius: 8,
    width: 28,
    height: 28,
    fontSize: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    marginBottom: 8,
  },
  username: { color: "var(--text-muted)", fontSize: 13.5, marginBottom: 22 },
  label: {
    alignSelf: "flex-start",
    fontSize: 12.5,
    color: "var(--text-muted)",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 14.5,
  },
  textarea: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 13.5,
    minHeight: 70,
    resize: "none",
    fontFamily: "inherit",
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
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontWeight: 600,
  },
  shareBtn: {
    marginTop: 10,
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13.5,
    fontWeight: 600,
  },
  divider: {
    width: "100%",
    height: 1,
    background: "var(--border-soft)",
    margin: "22px 0 16px",
  },
  lockSection: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  lockTitle: { fontSize: 14, fontWeight: 600 },
  lockSub: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5 },
  lockToggleBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    flexShrink: 0,
  },
  lockToggleOn: { background: "var(--danger)", color: "#fff", borderColor: "var(--danger)" },
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
    fontWeight: 600,
  },
  cancelPinBtn: {
    marginTop: 14,
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12.5,
    textDecoration: "underline",
  },
};
