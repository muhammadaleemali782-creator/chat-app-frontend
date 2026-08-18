export default function BrandPanel({ heading, sub }) {
  return (
    <div className="auth-brand-panel">
      {/* Dynamic Atmospheric Glows */}
      <div className="auth-brand-glow-1" />
      <div className="auth-brand-glow-2" />

      {/* Top Brand Wordmark */}
      <div className="auth-brand-top">
        <div className="auth-brand-logo-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <span className="auth-brand-title">
          Chatox<span style={{ color: "#38bdf8" }}>.</span>
        </span>
      </div>

      {/* Floating 3D Cards Matrix */}
      <div className="auth-floating-bubbles">
        <div className="auth-bubble-3d bubble-float-1">
          <span className="bubble-icon">👋</span>
          <div>
            <strong style={{ color: "#ffffff", fontSize: 13.5 }}>Hey there! Welcome to Chatox</strong>
            <p style={{ color: "#94a3b8", fontSize: 12, margin: "2px 0 0" }}>Private real-time workspace</p>
          </div>
        </div>

        <div className="auth-bubble-3d bubble-float-2">
          <span className="bubble-icon">🛡️</span>
          <div>
            <strong style={{ color: "#ffffff", fontSize: 13.5 }}>Zero Phone Number Leaks</strong>
            <p style={{ color: "#38bdf8", fontSize: 12, margin: "2px 0 0" }}>Connect purely via @username</p>
          </div>
        </div>

        <div className="auth-bubble-3d bubble-float-3">
          <span className="bubble-icon">⚡</span>
          <div>
            <strong style={{ color: "#ffffff", fontSize: 13.5 }}>Sub-30ms Sockets & HD Calls</strong>
            <p style={{ color: "#10b981", fontSize: 12, margin: "2px 0 0" }}>● Live encrypted connection</p>
          </div>
        </div>
      </div>

      {/* Bottom Brand Narrative */}
      <div className="auth-brand-footer-block">
        <h1 className="auth-brand-heading">{heading}</h1>
        <p className="auth-brand-sub">{sub}</p>

        <div className="auth-brand-stats-row">
          <div className="auth-stat-pill">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ color: "#ffffff" }}>100% Encrypted</span>
          </div>
          <div className="auth-stat-pill">
            <span style={{ color: "#ffffff" }}>📞 HD Calling</span>
          </div>
          <div className="auth-stat-pill">
            <span style={{ color: "#ffffff" }}>📊 Smart Sheets</span>
          </div>
        </div>

        <p className="auth-brand-credit">
          Crafted with precision • Powered by <strong style={{ color: "#e2e8f0" }}>Educa Veda Digitals</strong>
        </p>
      </div>
    </div>
  );
}
