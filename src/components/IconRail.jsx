import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import ModalPortal from "./ModalPortal.jsx";

const THEME_META = {
  blue:       { icon: "🔵", label: "Royal Blue & White", desc: "Reference 3D Workspace Theme" },
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
    { key: "chat", label: "MESSAGES", icon: "💬", badge: "358" },
    { key: "calendar", label: "CALENDAR", icon: "📅", badge: null },
    { key: "calls", label: "CALLS", icon: "📞", badge: null },
  ];

  return (
    <>
      <nav
        style={{
          ...styles.rail,
          width: collapsed ? 74 : 200,
          minWidth: collapsed ? 74 : 200,
          padding: collapsed ? "16px 8px" : "20px 0 16px 14px",
        }}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* Top Header: Brand Wordmark + Collapse Toggle */}
        <div
          style={{
            ...styles.brandHeader,
            justifyContent: collapsed ? "center" : "space-between",
            paddingRight: collapsed ? 0 : 14,
          }}
        >
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

        {/* User Profile Pill / Avatar */}
        <div style={{ paddingRight: collapsed ? 0 : 14, marginBottom: 20 }}>
          <button
            type="button"
            style={{
              ...styles.userProfilePill,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "6px" : "7px 12px",
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
        </div>

        {/* Navigation List with Organic Cutout Scoop Curve */}
        <div style={styles.navList}>
          {!collapsed && <div style={styles.navSectionLabel}>NAVIGATION</div>}
          {navItems.map((item) => {
            const isActive = page === item.key;
            return (
              <div key={item.key} style={styles.navItemWrap}>
                <button
                  key={item.key}
                  type="button"
                  style={{
                    ...styles.navBtn,
                    ...(collapsed ? styles.navBtnCollapsed : {}),
                    ...(isActive && !collapsed ? styles.navBtnActive : {}),
                    ...(isActive && collapsed ? styles.navBtnCollapsedActive : {}),
                  }}
                  className={`rail-nav-item ${isActive && !collapsed ? "rail-scoop-active" : ""}`}
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
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Theme Selector & Logout */}
        <div
          style={{
            ...styles.bottomSection,
            paddingRight: collapsed ? 0 : 14,
          }}
        >
          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              ...(collapsed ? styles.bottomBtnCollapsed : {}),
            }}
            onClick={() => setShowThemePicker(true)}
            title="Theme badlo"
          >
            <span style={{ fontSize: 16 }}>🎨</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>THEME / SETTINGS</span>}
          </button>

          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              ...(collapsed ? styles.bottomBtnCollapsed : {}),
              color: "#FECACA",
            }}
            onClick={() => {
              if (window.confirm("Kya aap logout karna chahte hain?")) {
                logout();
              }
            }}
            title="Logout"
          >
            <span style={{ fontSize: 16 }}>🚪</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>LOGOUT</span>}
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
                      <div style={{ fontWeight: 800, fontSize: 13, color: isActive ? "#4F46E5" : "#0F172A" }}>
                        {meta.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, textAlign: "center" }}>
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
    background: "linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    zIndex: 10,
    userSelect: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    borderRadius: "24px 0 0 24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
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
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    padding: "11px 14px",
    borderRadius: "24px 0 0 24px",
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
  navBtnCollapsed: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 44,
    height: 44,
    margin: "0 auto",
    borderRadius: "50%",
  },
  navBtnActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    fontWeight: 900,
  },
  navBtnCollapsedActive: {
    background: "#FFFFFF",
    color: "#4F46E5",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    fontWeight: 900,
    transform: "scale(1.05)",
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
    padding: "9px 10px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
    width: "100%",
  },
  bottomBtnCollapsed: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 44,
    height: 44,
    margin: "0 auto",
    borderRadius: "50%",
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
    borderColor: "#4F46E5",
    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.2)",
  },
  themeActiveBadge: {
    marginTop: 8,
    background: "#4F46E5",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 20,
  },
};
