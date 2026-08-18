import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";

const THEME_META = {
  talkiepro: { icon: "🟣", label: "TalkiePro" },
  dark: { icon: "🌙", label: "Dark" },
  light: { icon: "☀️", label: "Light" },
  blue: { icon: "🔵", label: "Blue" },
  white: { icon: "⚪", label: "White" },
};

export default function IconRail({ page, onPageChange, hideOnMobileChat, onOpenProfile }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const pickerRef = useRef(null);
  const color = avatarColor(user?.displayName || "");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const items = [
    { key: "chat", icon: "💬", label: "Chat" },
    { key: "calendar", icon: "📅", label: "Calendar" },
    { key: "calls", icon: "📞", label: "Calls" },
  ];

  return (
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
      <div style={styles.bottomActions} className="icon-rail-bottom" ref={pickerRef}>
        <div style={{ position: "relative" }}>
          {showThemePicker && (
            <div style={styles.themePopover} className="theme-popover">
              <div style={styles.themePopoverHeader}>Choose Theme</div>
              {Object.entries(THEME_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  style={{
                    ...styles.themeOption,
                    ...(theme === key ? styles.themeOptionActive : {}),
                  }}
                  onClick={() => {
                    setTheme(key);
                    setShowThemePicker(false);
                  }}
                >
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontWeight: theme === key ? 700 : 500 }}>{meta.label}</span>
                  {theme === key && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            style={styles.iconBtn}
            onClick={() => setShowThemePicker((s) => !s)}
            title="Theme badlo"
          >
            {THEME_META[theme]?.icon || "🎨"}
          </button>
        </div>

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
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
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
    background: "var(--accent)",
    color: "#ffffff !important",
    boxShadow: "0 4px 12px var(--accent-glow)",
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
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--rail-text)",
    borderRadius: 10,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  themePopover: {
    position: "absolute",
    bottom: "calc(100% + 12px)",
    right: 0,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    boxShadow: "var(--shadow)",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 150,
    zIndex: 999,
  },
  themePopoverHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "4px 8px 6px",
    borderBottom: "1px solid var(--border-soft)",
    marginBottom: 2,
  },
  themeOption: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    transition: "background 0.12s ease",
  },
  themeOptionActive: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    fontWeight: 700,
  },
};
