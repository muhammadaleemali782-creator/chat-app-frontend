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
  const [collapsed, setCollapsed] = useState(false);
  const color = avatarColor(user?.displayName || "User");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const navItems = [
    { key: "chat", label: "Messages", icon: "💬", badge: "Live" },
    { key: "calendar", label: "Calendar", icon: "📅", badge: null },
    { key: "calls", label: "Calls", icon: "📞", badge: null },
  ];

  return (
    <>
      <nav
        style={{
          ...styles.rail,
          width: collapsed ? 70 : 185,
          minWidth: collapsed ? 70 : 185,
        }}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* 1. App Header with Collapse Toggle */}
        <div style={{ ...styles.brandHeader, justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <div style={styles.brandTitleWrap}>
              <div style={styles.brandIconCircle}>⚡</div>
              <span style={styles.brandTitle}>Chatox</span>
            </div>
          )}

          <button
            type="button"
            style={styles.collapseToggleBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Sidebar Expand Karo" : "Sidebar Collapse Karo"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* 2. User Profile Pill / Circular Avatar */}
        <button
          type="button"
          style={{
            ...styles.userProfilePill,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "6px" : "7px 10px",
          }}
          onClick={onOpenProfile}
          title={`Profile: @${user?.username}`}
        >
          <div style={{ ...styles.userAvatar, background: color.bg, color: color.fg }}>
            {initial}
          </div>
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.displayName || "User"}</div>
              <div style={styles.userHandle}>@{user?.username || "me"}</div>
            </div>
          )}
        </button>

        {/* 3. Primary Navigation List (Fluid Rounded Pills with Smooth Transition) */}
        <div style={styles.navList}>
          {!collapsed && <div style={styles.navSectionLabel}>MENU</div>}
          {navItems.map((item) => {
            const isActive = page === item.key;
            return (
              <button
                key={item.key}
                type="button"
                style={{
                  ...styles.navBtn,
                  ...(collapsed ? styles.navBtnCollapsed : {}),
                  ...(isActive ? styles.navBtnActive : {}),
                }}
                className={`rail-nav-item ${isActive ? "active" : ""}`}
                onClick={() => onPageChange(item.key)}
                title={item.label}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
                {!collapsed && item.badge && (
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

        {/* 4. Bottom Actions: Theme Selector & Logout */}
        <div style={styles.bottomSection}>
          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onClick={() => setShowThemePicker(true)}
            title="Theme badlo"
          >
            <span style={{ fontSize: 16 }}>🎨</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>Themes</span>}
          </button>

          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              color: "#FECACA",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onClick={() => {
              if (window.confirm("Kya aap logout karna chahte hain?")) {
                logout();
              }
            }}
            title="Logout"
          >
            <span style={{ fontSize: 16 }}>🚪</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>Logout</span>}
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
    flexShrink: 0,
    background: "linear-gradient(180deg, #4F46E5 0%, #3730A3 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "16px 10px",
    height: "100%",
    position: "relative",
    zIndex: 10,
    userSelect: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    transition: "width 0.28s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
    borderRadius: "24px 0 0 24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
    padding: "0 4px",
    height: 34,
  },
  brandTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  collapseToggleBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.16)",
    border: "none",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease, background 0.15s ease",
  },
  userProfilePill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: 24,
    cursor: "pointer",
    marginBottom: 18,
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%",
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 12.5,
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 12,
    fontWeight: 800,
    color: "#ffffff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userHandle: {
    fontSize: 10,
    color: "#C7D2FE",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navSectionLabel: {
    fontSize: 9.5,
    fontWeight: 800,
    color: "rgba(255, 255, 255, 0.45)",
    letterSpacing: "0.08em",
    padding: "0 8px 4px",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    flex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 24,
    border: "none",
    background: "transparent",
    color: "#E0E7FF",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
    textAlign: "left",
    width: "100%",
    position: "relative",
  },
  navBtnCollapsed: {
    justifyContent: "center",
    padding: "10px 0",
    borderRadius: "50%",
    width: 44,
    height: 44,
    margin: "0 auto",
  },
  navBtnActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.16)",
    fontWeight: 800,
    transform: "scale(1.02)",
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    flex: 1,
    whiteSpace: "nowrap",
  },
  navBadge: {
    background: "rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
    fontSize: 9.5,
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
    gap: 4,
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: 10,
  },
  bottomBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "#C7D2FE",
    padding: "8px 10px",
    borderRadius: 20,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.02em",
    cursor: "pointer",
    transition: "all 0.18s ease",
    textAlign: "left",
    width: "100%",
  },
  bottomBtnLabel: {
    flex: 1,
    whiteSpace: "nowrap",
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
