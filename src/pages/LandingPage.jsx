import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import InteractiveMockup from "../components/InteractiveMockup.jsx";
import ThreeDTiltCard from "../components/ThreeDTiltCard.jsx";
import ThreeDFeatureShowcase from "../components/ThreeDFeatureShowcase.jsx";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqs = [
    {
      q: "Why do I NOT need a phone number to use Chatox?",
      a: "Chatox is designed with a privacy-first mindset. Unlike traditional apps that expose your personal mobile number to every contact and group member, Chatox uses unique @usernames. You retain total control over your identity without worrying about spam or data brokers."
    },
    {
      q: "How does the built-in Smart Sheets feature work?",
      a: "Inside any group or direct conversation, you can create or attach live collaborative spreadsheets ('Smart Sheets'). Team members can edit numbers, track roadmap items, and see live updates in real time without leaving the chat window."
    },
    {
      q: "Are the audio and video calls free with high quality?",
      a: "Yes! Chatox uses modern peer-to-peer and WebRTC protocols for low-latency HD voice and video calling. There are no call limits or hidden fees."
    },
    {
      q: "Can I lock my private conversations on shared computers or phones?",
      a: "Yes. Chatox includes an App Lock Gate. You can set a secure PIN to prevent unauthorized access whenever your device is left unattended."
    },
    {
      q: "Is Chatox available on mobile as well as desktop?",
      a: "Chatox is fully responsive on desktop browsers, tablets, and smartphones, and also runs as a native hybrid application with Capacitor and local push notifications."
    }
  ];

  return (
    <div className="landing-page">
      <div className="landing-bg-glow-1" />
      <div className="landing-bg-glow-2" />

      {/* 1. Glassmorphism Sticky Navbar */}
      <header className="landing-navbar">
        <div className="landing-container">
          <div className="landing-nav-inner">
            <Link to="/" className="landing-brand">
              <div className="landing-brand-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="landing-brand-name">
                Chatox<span className="dot" style={{ color: "var(--amber)" }}>.</span>
              </div>
            </Link>

            <nav className="landing-nav-links">
              <a href="#features" className="landing-nav-link">Features</a>
              <a href="#why-chatox" className="landing-nav-link">Why Chatox?</a>
              <a href="#3d-showcase" className="landing-nav-link">3D Matrix</a>
              <a href="#demo" className="landing-nav-link">Live Demo</a>
              <a href="#security" className="landing-nav-link">Security</a>
              <a href="#faq" className="landing-nav-link">FAQ</a>
            </nav>

            <div className="landing-nav-actions">
              <button
                type="button"
                className="theme-pill-btn"
                onClick={toggleTheme}
                title="Change theme palette"
              >
                <span>🎨</span>
                <span style={{ textTransform: "capitalize" }}>{theme}</span>
              </button>

              {user ? (
                <button
                  type="button"
                  className="btn-primary-glow hide-on-mobile"
                  onClick={() => navigate("/app")}
                >
                  <span>Launch Web App</span>
                  <span>→</span>
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary-outline hide-on-mobile">
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary-glow hide-on-mobile">
                    <span>Get Started</span>
                    <span>→</span>
                  </Link>
                </>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <a href="#features" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#why-chatox" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Why Chatox?</a>
            <a href="#3d-showcase" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>3D Spatial Matrix</a>
            <a href="#demo" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Live Interactive Demo</a>
            <a href="#security" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Security & App Lock</a>
            <a href="#faq" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {user ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { setMobileMenuOpen(false); navigate("/app"); }}
                >
                  Open Chatox App 🚀
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary-outline"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary-glow"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-pill-badge">
            <span>✨</span>
            <span>Privacy-First • No Phone Number Required • HD Calling</span>
          </div>

          <h1 className="hero-title">
            Chat, Collaborate & Plan in One <br />
            <span className="hero-gradient-text">Private, Ultra-Fast Workspace.</span>
          </h1>

          <p className="hero-subtitle">
            Say goodbye to spam calls and phone number leaks. Connect purely via unique <strong>@usernames</strong>,
            enjoy crystal-clear <strong>HD audio & video calls</strong>, collaborate on <strong>live sheets</strong>,
            and organize your team with <strong>integrated calendar meetings</strong>.
          </p>

          <div className="hero-cta-group">
            {user ? (
              <button
                type="button"
                className="btn-primary-glow"
                style={{ fontSize: 16, padding: "14px 32px" }}
                onClick={() => navigate("/app")}
              >
                <span>Open Chatox App</span>
                <span style={{ fontSize: 18 }}>🚀</span>
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary-glow"
                  style={{ fontSize: 16, padding: "14px 32px" }}
                >
                  <span>Create Free Account</span>
                  <span style={{ fontSize: 18 }}>⚡</span>
                </Link>
                <a
                  href="#demo"
                  className="btn-secondary-outline"
                  style={{ fontSize: 16, padding: "14px 28px" }}
                >
                  <span>Interactive Live Demo</span>
                  <span>👇</span>
                </a>
              </>
            )}
          </div>

          <div className="hero-trust-bar">
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span> 100% Free & Unlimited
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span> Zero Phone Number Tracking
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span> WebRTC HD Audio/Video
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span> PIN & Biometric App Lock
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3D Spatial Feature Showcase Section */}
      <section id="3d-showcase" className="landing-container" style={{ padding: "40px 0 60px", scrollMarginTop: 80 }}>
        <div className="section-header" style={{ marginBottom: 30 }}>
          <span className="section-badge">3D SPATIAL ARCHITECTURE</span>
          <h2 className="section-title">Interactive 3D Workspace Engine</h2>
          <p className="section-subtitle">Move your cursor or touch to rotate the 3D depth matrix.</p>
        </div>
        <ThreeDFeatureShowcase />
      </section>

      {/* 4. Interactive Live Demo Section */}
      <section id="demo" className="landing-container" style={{ scrollMarginTop: 90 }}>
        <div className="section-header">
          <span className="section-badge">Live Interactive Simulator</span>
          <h2 className="section-title">Try Chatox Right In Your Browser</h2>
          <p className="section-subtitle">Click across tabs to experience live chat, HD video rooms, collaborative smart sheets, and calendar scheduling.</p>
        </div>
        <InteractiveMockup />
      </section>

      {/* 5. Stats Ribbon */}
      <section className="stats-ribbon">
        <div className="landing-container">
          <div className="stats-grid">
            <div>
              <div className="stat-number">&lt; 30ms</div>
              <div className="stat-label">Real-Time Message Latency</div>
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Phone Privacy (@username only)</div>
            </div>
            <div>
              <div className="stat-number">99.99%</div>
              <div className="stat-label">WebSocket Connection Uptime</div>
            </div>
            <div>
              <div className="stat-number">4-in-1</div>
              <div className="stat-label">Chat + Calls + Sheets + Calendar</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "Why Chatox?" Bento Grid */}
      <section id="why-chatox" className="bento-section landing-container" style={{ scrollMarginTop: 80 }}>
        <div className="section-header">
          <span className="section-badge">Why Choose Chatox</span>
          <h2 className="section-title">Built for Privacy, Speed & Team Productivity</h2>
          <p className="section-subtitle">
            Most messaging platforms force you to reveal your personal mobile number or switch across 5 different apps. Chatox brings everything into one unified, secure experience.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Zero Phone Numbers */}
          <ThreeDTiltCard className="bento-card bento-card-span-8" maxTilt={8}>
            <div>
              <div className="bento-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="bento-title">Zero Phone Number Sharing — Pure @Username Identity</h3>
              <p className="bento-desc">
                Your private phone number is never asked, never stored, and never exposed to other users or group members. Share your unique username freely on social media or with coworkers without giving away personal contact details.
              </p>
            </div>
            <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: "14px 18px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search anyone instantly:</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, background: "var(--accent-soft)", color: "var(--accent)", padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>
                @alex_design • @sarah_dev
              </span>
            </div>
          </ThreeDTiltCard>

          {/* Card 2: Sub-millisecond WebSockets */}
          <ThreeDTiltCard className="bento-card bento-card-span-4" maxTilt={8}>
            <div>
              <div className="bento-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className="bento-title">Blazing Fast WebSockets</h3>
              <p className="bento-desc">
                Live typing pulses, immediate delivery ticks, online indicators, and instant notification sync powered by Socket.io engine.
              </p>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--amber)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="online-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />
              Sub-30ms socket handshake
            </div>
          </ThreeDTiltCard>

          {/* Card 3: HD Audio & Video Calls */}
          <ThreeDTiltCard className="bento-card bento-card-span-4" maxTilt={8}>
            <div>
              <div className="bento-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <h3 className="bento-title">HD Voice & Video Rooms</h3>
              <p className="bento-desc">
                Initiate one-on-one or group audio/video calls with clear audio, camera toggle, screen sharing, and mute controls.
              </p>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>WebRTC P2P Low-Latency Protocol</span>
          </ThreeDTiltCard>

          {/* Card 4: Collaborative Smart Sheets */}
          <ThreeDTiltCard className="bento-card bento-card-span-4" maxTilt={8}>
            <div>
              <div className="bento-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </div>
              <h3 className="bento-title">Smart Collaborative Sheets</h3>
              <p className="bento-desc">
                Embed live spreadsheets into your chats. Track sprint progress, budgets, and tasks together in real time.
              </p>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Auto-saving version history</span>
          </ThreeDTiltCard>

          {/* Card 5: Integrated Calendar & Meetings */}
          <ThreeDTiltCard className="bento-card bento-card-span-4" maxTilt={8}>
            <div>
              <div className="bento-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="bento-title">Calendar & Meeting Sync</h3>
              <p className="bento-desc">
                Schedule calls and team syncs directly within your calendar. Get automatic reminders before any session starts.
              </p>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>One-click room joining</span>
          </ThreeDTiltCard>
        </div>
      </section>

      {/* 7. Deep Feature Breakdown */}
      <section id="features" className="landing-container" style={{ padding: "80px 0", scrollMarginTop: 80 }}>
        <div className="section-header">
          <span className="section-badge">Feature Deep Dive</span>
          <h2 className="section-title">Everything You Need for Effortless Communication</h2>
          <p className="section-subtitle">A full-fledged communication suite designed to simplify daily collaboration.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <span style={{ background: "var(--accent-soft)", color: "var(--accent)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                VOICE & MEDIA
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, margin: "14px 0 16px" }}>
                Voice Notes, Files & Instant Media Sharing
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.6, marginBottom: 20 }}>
                Record crystal clear voice audio messages on the fly, send documents, photos, code snippets, and react with custom emoji feedback on any message bubble.
              </p>
              <ul style={{ paddingLeft: 20, color: "var(--text)", display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5 }}>
                <li>Waveform audio recording & preview player</li>
                <li>Fast image and document uploads</li>
                <li>Instant emoji reaction drawers</li>
              </ul>
            </div>
            <ThreeDTiltCard maxTilt={6}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 30, boxShadow: "var(--shadow-soft)" }}>
                <div style={{ background: "var(--surface-2)", borderRadius: 16, padding: 18, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    🎙️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Voice Note (0:24)</div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 4, marginTop: 6, position: "relative" }}>
                      <div style={{ width: "65%", height: "100%", background: "var(--accent)", borderRadius: 4 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>10:14 AM</span>
                </div>
                <div style={{ background: "var(--accent-soft)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 14, padding: "14px 16px", fontSize: 13.5, color: "var(--text)" }}>
                  💬 <strong>Reaction:</strong> &quot;Love this update, deploying now! 🔥&quot;
                </div>
              </div>
            </ThreeDTiltCard>
          </div>

          {/* Row 2 */}
          <div id="security" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center", scrollMarginTop: 80 }}>
            <ThreeDTiltCard maxTilt={6} style={{ order: 2 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 30, boxShadow: "var(--shadow-soft)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>🔒 Biometric & PIN Security Gate</span>
                    <span style={{ color: "var(--amber)", fontSize: 12, fontWeight: 700 }}>Active</span>
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>🔔 Capacitor Local Push Notifications</span>
                    <span style={{ color: "var(--amber)", fontSize: 12, fontWeight: 700 }}>Enabled</span>
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>🎨 5 Tailored Color Themes</span>
                    <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700 }}>Electric Blue / Dark / Light</span>
                  </div>
                </div>
              </div>
            </ThreeDTiltCard>

            <div style={{ order: 1 }}>
              <span style={{ background: "var(--accent-soft)", color: "var(--accent)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                SECURITY & CROSS-PLATFORM
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, margin: "14px 0 16px" }}>
                PIN App Lock Gate & Native Hybrid Mobile App
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.6, marginBottom: 20 }}>
                Protect sensitive company or personal chats when leaving your laptop open. Plus, install Chatox as an Android/iOS app with full offline resilience and hardware notification support.
              </p>
              <ul style={{ paddingLeft: 20, color: "var(--text)", display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5 }}>
                <li>Client-side PIN Gate for immediate screen locking</li>
                <li>Capacitor native bindings for mobile platforms</li>
                <li>5 sleek visual themes (Blue, Dark, Light, White, Cyber)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="faq-section landing-container" style={{ scrollMarginTop: 80 }}>
        <div className="section-header">
          <span className="section-badge">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about getting started with Chatox.</p>
        </div>

        <div>
          {faqs.map((f, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? "open" : ""}`}>
                <div
                  className="faq-header"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  role="button"
                  tabIndex={0}
                >
                  <h4 className="faq-question">{f.q}</h4>
                  <span className="faq-toggle-icon">{isOpen ? "×" : "+"}</span>
                </div>
                {isOpen && <div className="faq-body">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Conversion CTA Banner */}
      <section className="landing-container">
        <div className="cta-banner-card">
          <h2 className="cta-banner-title">
            Start Chatting Privately Today.
          </h2>
          <p className="cta-banner-desc">
            No phone number required. Create your unique @username in 15 seconds and experience real-time messaging, HD calls, and collaborative workspace tools.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {user ? (
              <button
                type="button"
                className="btn-cta-light"
                onClick={() => navigate("/app")}
              >
                <span>Go to Chat Dashboard</span>
                <span>→</span>
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-cta-light"
                >
                  <span>Sign Up with @Username</span>
                  <span>⚡</span>
                </Link>
                <Link
                  to="/login"
                  className="btn-cta-outline"
                >
                  <span>Log In to Existing Account</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="landing-brand">
                <div className="landing-brand-logo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="landing-brand-name">Chatox.</span>
              </div>
              <p className="footer-tagline">
                The privacy-first messaging and productivity platform. Built for teams, creators, and individuals who care about speed and identity protection.
              </p>
            </div>

            <div className="footer-links-grid">
              <div>
                <div className="footer-col-title">Navigation</div>
                <ul className="footer-link-list">
                  <li><a href="#features" className="footer-link">Features</a></li>
                  <li><a href="#why-chatox" className="footer-link">Why Chatox?</a></li>
                  <li><a href="#3d-showcase" className="footer-link">3D Matrix</a></li>
                  <li><a href="#demo" className="footer-link">Live Mockup</a></li>
                  <li><a href="#faq" className="footer-link">FAQ</a></li>
                </ul>
              </div>

              <div>
                <div className="footer-col-title">Product & Auth</div>
                <ul className="footer-link-list">
                  <li><Link to="/login" className="footer-link">Login</Link></li>
                  <li><Link to="/register" className="footer-link">Register</Link></li>
                  <li><Link to="/forgot-password" className="footer-link">Reset Password</Link></li>
                  {user && <li><Link to="/app" className="footer-link">Web App</Link></li>}
                </ul>
              </div>

              <div>
                <div className="footer-col-title">Platform</div>
                <ul className="footer-link-list">
                  <li><span className="footer-link">WebSocket v4 Engine</span></li>
                  <li><span className="footer-link">WebRTC Calling</span></li>
                  <li><span className="footer-link">Capacitor Mobile</span></li>
                  <li><span className="footer-link">Biometric PIN Gate</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} Chatox. All rights reserved.
            </div>
            <div>
              Powered by <strong>Educa Veda Digitals</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
