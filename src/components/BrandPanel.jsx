export default function BrandPanel({ heading, sub }) {
  return (
    <div className="auth-brand-panel">
      {/* 3D Atmospheric Background Glows */}
      <div className="auth-brand-glow-1" />
      <div className="auth-brand-glow-2" />

      {/* 1. Brand Header */}
      <div className="auth-brand-top">
        <div className="auth-brand-logo-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="auth-brand-title-wrap">
          <span className="auth-brand-title">Chatox<span style={{ color: "#38bdf8" }}>.</span></span>
          <span className="auth-brand-badge-pill">v4.0 Private</span>
        </div>
      </div>

      {/* 2. Centered 3D Glass Live Conversation Showcase */}
      <div className="auth-center-showcase">
        <div className="auth-showcase-card">
          <div className="auth-showcase-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="showcase-avatar">PD</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Product Design Guild</div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  3 members online
                </div>
              </div>
            </div>
            <span style={{ fontSize: 11, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
              Encrypted
            </span>
          </div>

          <div className="auth-showcase-messages">
            <div className="auth-showcase-msg msg-in">
              <div className="msg-user-tag">Sarah Jenkins</div>
              <div>Hey! Let&apos;s deploy the new sprint without phone number tracking 🚀</div>
              <div className="msg-time-tag">10:42 AM</div>
            </div>

            <div className="auth-showcase-msg msg-out">
              <div>Done! 100% encrypted via @usernames. Sockets running sub-30ms ⚡</div>
              <div className="msg-time-tag">10:43 AM <span style={{ color: "#38bdf8" }}>✓✓</span></div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            <span style={{ fontSize: 11, color: "#94a3b8" }}>🔒 Hardware PIN Gate & WebRTC Calls Active</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Brand Narrative (Well-Spaced & Beautifully Padded) */}
      <div className="auth-brand-footer-block">
        <h1 className="auth-brand-heading">{heading}</h1>
        <p className="auth-brand-sub">{sub}</p>

        <div className="auth-brand-stats-row">
          <div className="auth-stat-pill">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
            <span>100% Encrypted</span>
          </div>
          <div className="auth-stat-pill">
            <span>📹 WebRTC HD Calls</span>
          </div>
          <div className="auth-stat-pill">
            <span>📊 Smart Sheets</span>
          </div>
        </div>

        <p className="auth-brand-credit">
          Crafted with precision • Powered by <strong style={{ color: "#e2e8f0" }}>Educa Veda Digitals</strong>
        </p>
      </div>
    </div>
  );
}
