import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";
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
  const color = avatarColor(user?.displayName || "");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const navItems = [
    { key: "chat", label: "MESSAGES", icon: "✉️", badge: "Live" },
    { key: "calendar", label: "CALENDAR", icon: "📅", badge: null },
    { key: "calls", label: "CALLS", icon: "📞", badge: null },
  ];

  const miniChips = [
    { id: "c1", label: "D", bg: "#F59E0B" },
    { id: "c2", label: "A", bg: "#8B5CF6" },
    { id: "c3", label: "C", bg: "#EC4899" },
    { id: "c4", label: "+", bg: "rgba(255,255,255,0.2)" },
  ];

  return (
    <>
      <nav
        style={styles.rail}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* Left Sub-Strip (Brand & Mini Chips) */}
        <div style={styles.miniStrip} className="hide-on-mobile">
          <div style={styles.verticalBrand}>Chatox.</div>
          <div style={styles.chipStack}>
            {miniChips.map((c) => (
              <div key={c.id} style={{ ...styles.miniChip, background: c.bg }}>
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main Rail Content */}
        <div style={styles.railMain}>
          {/* Top Org/Workspace Switcher Header */}
          <div style={styles.topHeader}>
            <button
              type="button"
              style={styles.orgDropdownBtn}
              onClick={onOpenProfile}
              title={`Logged in as @${user?.username}`}
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
                <button
                  key={item.key}
                  type="button"
                  style={{
                    ...styles.navBtn,
                    ...(isActive ? styles.navBtnActive : {}),
                  }}
                  className={`rail-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => onPageChange(item.key)}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span style={{ ...styles.navBadge, ...(isActive ? styles.navBadgeActive : {}) }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div style={styles.bottomSection}>
            <button
              type="button"
              style={styles.bottomBtn}
              onClick={() => setShowThemePicker(true)}
              title="Theme change karo"
            >
              <span style={{ fontSize: 16 }}>🎨</span>
              <span style={styles.bottomBtnLabel}>THEME / SETTINGS</span>
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
                    Theme Choose Karo
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
    background: "rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    gap: 20,
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  verticalBrand: {
    color: "#ffffff",
    fontWeight: 900,
    fontFamily: "var(--font-display)",
    fontSize: 13,
    letterSpacing: "0.08em",
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
  },
  chipStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: "auto",
  },
  miniChip: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
  railMain: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px",
    height: "100%",
    boxSizing: "border-box",
  },
  topHeader: {
    marginBottom: 28,
  },
  orgDropdownBtn: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: "6px 14px",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  orgName: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },
  orgArrow: {
    fontSize: 12,
    opacity: 0.8,
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 14,
    border: "none",
    background: "transparent",
    color: "#E0E7FF",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "all 0.18s ease",
    textAlign: "left",
    position: "relative",
  },
  navBtnActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.15)",
    fontWeight: 900,
    borderRadius: "14px 0 0 14px",
    marginRight: -12,
    paddingRight: 24,
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    flex: 1,
  },
  navBadge: {
    background: "rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 10,
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
    background: "var(--surface)",
    border: "1px solid var(--border)",
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
    borderBottom: "1px solid var(--border)",
  },
  themeModalClose: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
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
    background: "var(--surface-2)",
    border: "1.5px solid var(--border)",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  themeCardActive: {
    background: "var(--accent-soft)",
    borderColor: "var(--accent)",
    boxShadow: "0 4px 14px var(--accent-glow)",
  },
  themeActiveBadge: {
    marginTop: 8,
    background: "var(--accent)",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 20,
  },
};
