import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import ModalPortal from "./ModalPortal.jsx";

const THEME_META = {
  blue:       { icon: "🔵", label: "Royal Blue & White", desc: "Clean 3D Workspace Theme" },
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
  const color = avatarColor(user?.displayName || "User");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const navItems = [
    { key: "chat", label: "MESSAGES", icon: "💬", badge: "Live" },
    { key: "calendar", label: "CALENDAR", icon: "📅", badge: null },
    { key: "calls", label: "CALLS", icon: "📞", badge: null },
  ];

  return (
    <>
      <nav
        style={styles.rail}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* 1. App Wordmark Brand Header */}
        <div style={styles.brandHeader}>
          <div style={styles.brandLogoBox}>
            <span style={{ fontSize: 18 }}>⚡</span>
          </div>
          <div style={styles.brandTextWrap}>
            <span style={styles.brandTitle}>Chatox</span>
            <span style={styles.brandSub}>Workspace</span>
          </div>
        </div>

        {/* 2. User Profile Summary Pill */}
        <button
          type="button"
          style={styles.userProfilePill}
          onClick={onOpenProfile}
          title={`Profile: @${user?.username}`}
        >
          <div style={{ ...styles.userAvatar, background: color.bg, color: color.fg }}>
            {initial}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.displayName || "User"}</div>
            <div style={styles.userHandle}>@{user?.username || "me"}</div>
          </div>
          <span style={styles.profileArrow}>›</span>
        </button>

        {/* 3. Primary Navigation List */}
        <div style={styles.navList}>
          <div style={styles.navSectionLabel}>NAVIGATION</div>
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
            );
          })}
        </div>

        {/* 4. Bottom Controls: Theme Switcher & Logout */}
        <div style={styles.bottomSection}>
          <button
            type="button"
            style={styles.bottomBtn}
            onClick={() => setShowThemePicker(true)}
            title="Theme badlo"
          >
            <span style={{ fontSize: 16 }}>🎨</span>
            <span style={styles.bottomBtnLabel}>THEME / SETTINGS</span>
          </button>

          <button
            type="button"
            style={{ ...styles.bottomBtn, color: "#FECACA" }}
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
    width: 215,
    minWidth: 200,
    flexShrink: 0,
    background: "linear-gradient(180deg, #4F46E5 0%, #3730A3 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 14px 16px",
    height: "100%",
    position: "relative",
    zIndex: 10,
    userSelect: "none",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    padding: "0 6px",
  },
  brandLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#ffffff",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  brandSub: {
    fontSize: 10,
    color: "#C7D2FE",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  userProfilePill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: "8px 12px",
    cursor: "pointer",
    marginBottom: 24,
    transition: "all 0.18s ease",
    textAlign: "left",
    width: "100%",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: 800,
    color: "#ffffff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userHandle: {
    fontSize: 10.5,
    color: "#C7D2FE",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  profileArrow: {
    color: "#C7D2FE",
    fontSize: 16,
    fontWeight: 700,
  },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: "0.08em",
    padding: "0 8px 6px",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
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
    width: "100%",
  },
  navBtnActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    fontWeight: 900,
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
  },
  bottomBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "none",
    color: "#C7D2FE",
    padding: "9px 12px",
    borderRadius: 12,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
    width: "100%",
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
