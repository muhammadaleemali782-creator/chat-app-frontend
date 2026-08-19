import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ModalPortal from "./ModalPortal.jsx";

const THEME_META = {
  blue:       { icon: "🔵", label: "Image 2 Purple/Blue", desc: "Reference 3D Workspace Theme" },
  chatox:     { icon: "🌊", label: "Chatox Teal", desc: "Teal green wave mobile theme" },
  pinky:      { icon: "🌸", label: "Pinky Rose", desc: "Vibrant pink bubbles theme" },
  talkiepro: { icon: "🟣", label: "TalkiePro Dark", desc: "Deep navy indigo style" },
  dark:       { icon: "🌙", label: "Midnight Dark", desc: "High contrast dark mode" },
  light:      { icon: "☀️", label: "Pure Light", desc: "Clean modern light theme" },
  white:      { icon: "⚪", label: "Minimal White", desc: "Monochrome minimal layout" },
};

export default function IconRail({ page, onPageChange, hideOnMobileChat, onOpenProfile }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const navItems = [
    { key: "dashboard", label: "DASHBOARD", icon: "⚡", route: false },
    { key: "shipment", label: "SHIPMENT", icon: "📦", route: false },
    { key: "tracking", label: "TRACKING", icon: "🌐", route: false },
    { key: "chat", label: "MESSAGES", icon: "✉️", badge: "358", route: true },
    { key: "calendar", label: "CALENDAR", icon: "📅", route: true },
    { key: "calls", label: "CALLS", icon: "📞", route: true },
  ];

  const miniChips = [
    { id: "c1", label: "D", bg: "#EAB308", color: "#ffffff" },
    { id: "c2", label: "A", bg: "#A855F7", color: "#ffffff" },
    { id: "c3", label: "C", bg: "#F43F5E", color: "#ffffff" },
    { id: "c4", label: "+", bg: "rgba(255,255,255,0.22)", color: "#ffffff" },
  ];

  return (
    <>
      <nav
        style={styles.rail}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* 1. Leftmost Mini Sub-Strip with Vertical Brand & Circular Action Chips */}
        <div style={styles.miniStrip} className="hide-on-mobile">
          <div style={styles.verticalBrand}>Chatox.</div>
          <div style={styles.chipStack}>
            {miniChips.map((c) => (
              <div
                key={c.id}
                style={{ ...styles.miniChip, background: c.bg, color: c.color }}
                title={`Workspace ${c.label}`}
              >
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Main Rail Menu */}
        <div style={styles.railMain}>
          {/* Top Organization Switcher Pill */}
          <div style={styles.topHeader}>
            <button
              type="button"
              style={styles.orgDropdownBtn}
              onClick={onOpenProfile}
              title={`Profile (@${user?.username})`}
            >
              <span style={styles.orgName}>CHATOX HUB</span>
              <span style={styles.orgArrow}>⌄</span>
            </button>
          </div>

          {/* Nav List */}
          <div style={styles.navList}>
            {navItems.map((item) => {
              const isActive = page === item.key;
              return (
                <div key={item.key} style={styles.navItemWrap}>
                  <button
                    type="button"
                    style={{
                      ...styles.navBtn,
                      ...(isActive ? styles.navBtnActive : {}),
                    }}
                    className={`rail-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (item.route) onPageChange(item.key);
                    }}
                  >
                    <span style={styles.navIcon}>{item.icon}</span>
                    <span style={styles.navLabel}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          ...styles.navBadge,
                          ...(isActive ? styles.navBadgeActive : {}),
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Settings & Logout */}
          <div style={styles.bottomSection}>
            <button
              type="button"
              style={styles.bottomBtn}
              onClick={() => setShowThemePicker(true)}
              title="Theme badlo"
            >
              <span style={{ fontSize: 16 }}>⚙️</span>
              <span style={styles.bottomBtnLabel}>SETTINGS / THEME</span>
            </button>

            <button
              type="button"
              style={styles.bottomBtn}
              onClick={() => {
                if (window.confirm("Kya aap logout karna chahte hain?")) {
                  logout();
                }
              }}
              title="Logout"
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              <span style={styles.bottomBtnLabel}>LOGOUT</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Theme Selector Modal */}
      {showThemePicker && (
        <ModalPortal>
          <div style={styles.themeBackdrop} onClick={() => setShowThemePicker(false)}>
            <div style={styles.themeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.themeModalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🎨</span>
                  <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)" }}>
                    Theme Select Karo
                  </span>
                </div>
                <button
                  style={styles.themeModalClose}
                  onClick={() => setShowThemePicker(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div style={styles.themeGrid}>
                {Object.entries(THEME_META).map(([key, meta]) => {
                  const isActive = theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      style={{
                        ...styles.themeCard,
                        ...(isActive ? styles.themeCardActive : {}),
                      }}
                      onClick={() => {
                        setTheme(key);
                        setShowThemePicker(false);
                      }}
                    >
                      <span style={{ fontSize: 26, marginBottom: 2 }}>{meta.icon}</span>
                      <div style={{ fontWeight: 800, fontSize: 13, color: isActive ? "var(--accent)" : "var(--text)" }}>
                        {meta.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, textAlign: "center" }}>
                        {meta.desc}
                      </div>
                      {isActive && (
                        <div style={styles.themeActiveBadge}>
                          ✓ Active Theme
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

const styles = {
  rail: {
    width: 220,
    minWidth: 200,
    flexShrink: 0,
    background: "linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)",
    display: "flex",
    height: "100%",
    position: "relative",
    zIndex: 10,
    userSelect: "none",
    overflow: "hidden",
  },
  miniStrip: {
    width: 44,
    background: "rgba(0, 0, 0, 0.16)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 0 20px",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  verticalBrand: {
    color: "#ffffff",
    fontWeight: 900,
    fontFamily: "var(--font-display)",
    fontSize: 14,
    letterSpacing: "0.08em",
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    marginBottom: 40,
  },
  chipStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: "auto",
  },
  miniChip: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: 11,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  railMain: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px 0 16px 14px",
    height: "100%",
    boxSizing: "border-box",
  },
  topHeader: {
    marginBottom: 24,
    paddingRight: 14,
  },
  orgDropdownBtn: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: 20,
    padding: "7px 16px",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  orgName: {
    fontSize: 11.5,
    fontWeight: 900,
    letterSpacing: "0.05em",
  },
  orgArrow: {
    fontSize: 12,
    opacity: 0.8,
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  navItemWrap: {
    position: "relative",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: "20px 0 0 20px",
    border: "none",
    background: "transparent",
    color: "#E0E7FF",
    cursor: "pointer",
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "all 0.15s ease",
    textAlign: "left",
    width: "100%",
  },
  navBtnActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    boxShadow: "-4px 4px 18px rgba(0, 0, 0, 0.12)",
    fontWeight: 900,
    position: "relative",
    zIndex: 2,
  },
  navIcon: {
    fontSize: 15,
  },
  navLabel: {
    flex: 1,
  },
  navBadge: {
    background: "rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 12,
  },
  navBadgeActive: {
    background: "rgba(79, 70, 229, 0.12)",
    color: "#4F46E5",
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: 14,
    paddingRight: 14,
  },
  bottomBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "#C7D2FE",
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
  },
  bottomBtnLabel: {
    flex: 1,
  },
  themeBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  themeModal: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: "85vh",
    overflowY: "auto",
  },
  themeModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  themeModalClose: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 13,
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 10,
  },
  themeCard: {
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  themeCardActive: {
    background: "#EFF6FF",
    borderColor: "#2563EB",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
  },
  themeActiveBadge: {
    marginTop: 8,
    background: "#2563EB",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 20,
  },
};
