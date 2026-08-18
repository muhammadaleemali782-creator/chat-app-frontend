export default function BrandPanel({ heading, sub }) {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-glow-1" />
      <div className="auth-brand-glow-2" />

      {/* Floating 3D Message Matrix */}
      <div className="auth-floating-bubbles">
        <div className="auth-bubble-3d bubble-float-1">
          <span className="bubble-icon">👋</span>
          <div>
            <strong>Hey there!</strong>
            <p>Welcome to Chatox v4</p>
          </div>
        </div>

        <div className="auth-bubble-3d bubble-float-2">
          <span className="bubble-icon">🛡️</span>
          <div>
            <strong>Zero Phone Leaks</strong>
            <p>Pure @username identity</p>
          </div>
        </div>

        <div className="auth-bubble-3d bubble-float-3">
          <span className="bubble-icon">⚡</span>
          <div>
            <strong>Sub-30ms Sockets</strong>
            <p>Real-time delivery ticks</p>
          </div>
        </div>
      </div>

      {/* Bottom Brand Identity */}
      <div className="auth-brand-footer-block">
        <div className="landing-brand" style={{ marginBottom: 18 }}>
          <div className="landing-brand-logo" style={{ width: 42, height: 42, borderRadius: 14 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="landing-brand-name" style={{ fontSize: 28 }}>
            Chatox<span className="dot" style={{ color: "var(--amber)" }}>.</span>
          </div>
        </div>

        <h1 className="auth-brand-heading">{heading}</h1>
        <p className="auth-brand-sub">{sub}</p>

        <div className="auth-brand-stats-row">
          <div className="auth-stat-pill">
            <span className="online-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span>100% Encrypted</span>
          </div>
          <div className="auth-stat-pill">
            <span>📞 WebRTC HD Calls</span>
          </div>
          <div className="auth-stat-pill">
            <span>📊 Live Sheets</span>
          </div>
        </div>

        <p className="auth-brand-credit">Crafted with precision • Powered by <strong>Educa Veda Digitals</strong></p>
      </div>
    </div>
  );
}
