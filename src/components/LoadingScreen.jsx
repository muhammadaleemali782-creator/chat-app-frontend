import { useState, useEffect } from "react";

// Sukoon bhara loading screen - free hosting (Render) kabhi kabhi "so jaati" hai
// aur pehli request pe jagne me 20-30 second lag sakte hain. Blank screen dikhne
// ki jagah ek shanti wala breathing-dot animation dikhate hain, taaki wait karna
// bura na lage.
export default function LoadingScreen({ message, fullScreen = false, small = false }) {
  const [showColdStartHint, setShowColdStartHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowColdStartHint(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ ...styles.wrap, ...(fullScreen ? styles.fullScreen : {}) }}>
      <div style={{ ...styles.breathDot, ...(small ? styles.breathDotSmall : {}) }}>
        <span style={styles.dotCore} />
        <span style={styles.dotRing} />
      </div>
      {!small && (
        <div style={styles.text}>
          {message || "Ek pal ruko..."}
          {showColdStartHint && (
            <div style={styles.hint}>
              Server ko jaagne mein thoda time lag raha hai, bas kuch second aur 🙂
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 40,
    color: "var(--text-muted)",
  },
  fullScreen: {
    height: "100dvh",
    width: "100%",
    background: "var(--bg)",
  },
  breathDot: {
    position: "relative",
    width: 46,
    height: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  breathDotSmall: { width: 24, height: 24 },
  dotCore: {
    position: "absolute",
    width: "40%",
    height: "40%",
    borderRadius: "50%",
    background: "var(--accent)",
    animation: "breathPulse 1.8s ease-in-out infinite",
  },
  dotRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "2px solid var(--accent)",
    opacity: 0.35,
    animation: "breathRing 1.8s ease-in-out infinite",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 1.7,
  },
  hint: {
    fontSize: 12.5,
    color: "var(--text-faint)",
    marginTop: 6,
    maxWidth: 260,
  },
};
