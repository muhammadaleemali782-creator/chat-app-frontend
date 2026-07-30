// Auth pages (login/register) ka left-side visual panel
// Desktop pe dikhta hai, mobile pe CSS se hide ho jaata hai (.auth-brand-panel)

export default function BrandPanel({ heading, sub }) {
  return (
    <div className="auth-brand-panel" style={styles.wrap}>
      <div style={styles.glow} />

      <div style={styles.bubbles}>
        <div style={{ ...styles.bubble, ...styles.bubbleLeft1 }}>Hey! 👋</div>
        <div style={{ ...styles.bubble, ...styles.bubbleRight1 }}>Kaise ho?</div>
        <div style={{ ...styles.bubble, ...styles.bubbleLeft2 }}>@username se dhundo</div>
      </div>

      <div style={styles.textBlock}>
        <div className="wordmark" style={{ fontSize: 30, marginBottom: 14 }}>
          Chat<span className="dot">.</span>
        </div>
        <h1 style={styles.heading}>{heading}</h1>
        <p style={styles.sub}>{sub}</p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(160deg, #151228 0%, #0d1017 55%, #0b0e14 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "56px",
  },
  glow: {
    position: "absolute",
    top: "-20%",
    left: "-10%",
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,111,240,0.28), transparent 70%)",
    filter: "blur(10px)",
  },
  bubbles: {
    position: "absolute",
    top: "18%",
    left: 0,
    right: 0,
    height: "45%",
  },
  bubble: {
    position: "absolute",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(6px)",
    color: "var(--text)",
    padding: "10px 16px",
    borderRadius: 16,
    fontSize: 14,
    fontFamily: "var(--font-body)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },
  bubbleLeft1: { top: 0, left: "8%", borderBottomLeftRadius: 4 },
  bubbleRight1: {
    top: 60,
    right: "10%",
    background: "rgba(124,111,240,0.25)",
    borderColor: "rgba(124,111,240,0.35)",
    borderBottomRightRadius: 4,
  },
  bubbleLeft2: { top: 130, left: "14%", borderBottomLeftRadius: 4 },
  textBlock: { position: "relative", maxWidth: 380 },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.25,
    margin: "0 0 10px",
    letterSpacing: "-0.01em",
  },
  sub: {
    color: "var(--text-muted)",
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
};
