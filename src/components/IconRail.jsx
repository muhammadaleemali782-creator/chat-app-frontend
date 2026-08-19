import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import ModalPortal from "./ModalPortal.jsx";

const THEME_META = {
  chatox:     { icon: "🌊", label: "Chatox Teal", desc: "Teal green wave mobile theme" },
  talkiepro: { icon: "🟣", label: "TalkiePro Purple", desc: "Deep purple & indigo style" },
  pinky:      { icon: "🌸", label: "Pinky Rose", desc: "Vibrant pink bubbles theme" },
  blue:       { icon: "🔵", label: "Ocean Blue", desc: "Soft blue card aesthetic" },
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

  const items = [
    { key: "chat", icon: "💬", label: "Chat" },
    { key: "calendar", icon: "📅", label: "Calendar" },
    { key: "calls", icon: "📞", label: "Calls" },
  ];

  return (
    <>
      <nav
        style={styles.rail}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* Profile Avatar Button */}
        <button
          type="button"
          style={{ ...styles.avatar, background: color.bg, color: color.fg }}
          title={`Profile (@${user?.username})`}
          className="icon-rail-avatar"
          onClick={onOpenProfile}
        >
          {initial}
        </button>

        {/* Center Nav Items */}
        <div style={styles.items} className="icon-rail-items">
          {items.map((item) => {
            const isActive = page === item.key;
            return (
              <button
                key={item.key}
                type="button"
                style={{
                  ...styles.item,
                  ...(isActive ? styles.itemActive : {}),
                }}
                className={`icon-rail-item ${isActive ? "active" : ""}`}
                onClick={() => onPageChange(item.key)}
                title={item.label}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label} className="icon-rail-item-label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right/Bottom Actions: Theme Switcher & Logout */}
        <div style={styles.bottomActions} className="icon-rail-bottom">
          <button
            type="button"
            style={styles.iconBtn}
            onClick={() => setShowThemePicker(true)}
            title="Theme badlo"
          >
            {THEME_META[theme]?.icon || "🎨"}
          </button>

          <button
            type="button"
            style={styles.iconBtn}
            onClick={() => {
              if (window.confirm("Kya aap logout karna chahte hain?")) {
                logout();
              }
            }}
            title="Logout"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Floating Theme Selector Modal (Always fully visible, never clipped) */}
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
    width: 68,
    flexShrink: 0,
    background: "var(--rail-bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 0",
    height: "100%",
    borderRight: "1px solid var(--border)",
  },
  avatar: {
    width: 38,
    height: 38,
    minWidth: 38,
    minHeight: 38,
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    fontSize: 14,
    marginBottom: 20,
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  item: {
    width: 52,
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 12,
    padding: "8px 4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    color: "var(--rail-text)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  itemActive: {
    background: "var(--rail-active-bg)",
    color: "var(--rail-bg)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  icon: { fontSize: 18, lineHeight: 1 },
  label: { fontSize: 10.5, fontWeight: 700 },
  bottomActions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flexShrink: 0,
    alignItems: "center",
  },
  iconBtn: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    color: "var(--rail-text)",
    borderRadius: 12,
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.15s ease",
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
