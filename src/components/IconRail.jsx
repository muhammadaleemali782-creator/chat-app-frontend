import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";

const THEME_META = {
  dark: { icon: "🌙", label: "Dark" },
  light: { icon: "☀️", label: "Light" },
  blue: { icon: "🔵", label: "Blue" },
  white: { icon: "⚪", label: "White" },
};

// Teams-jaisa narrow icon sidebar (desktop) - mobile pe top/bottom bar ban jaata hai (CSS se)
// hideOnMobileChat: jab true ho, mobile screen pe (jab koi chat khuli ho) yeh rail chhup jaati hai
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
    <div
      style={styles.rail}
      className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
    >
      <div
        style={{ ...styles.avatar, background: color.bg, color: color.fg, cursor: "pointer" }}
        title="Profile dekho"
        className="icon-rail-avatar"
        onClick={onOpenProfile}
      >
        {initial}
      </div>

      <div style={styles.items} className="icon-rail-items">
        {items.map((item) => (
          <button
            key={item.key}
            style={{
              ...styles.item,
              ...(page === item.key ? styles.itemActive : {}),
            }}
            className="icon-rail-item"
            onClick={() => onPageChange(item.key)}
            title={item.label}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label} className="icon-rail-item-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div style={styles.bottomActions} className="icon-rail-bottom" ref={pickerRef}>
        <div style={{ position: "relative" }}>
          {showThemePicker && (
            <div style={styles.themePopover} className="theme-popover">
              {Object.entries(THEME_META).map(([key, meta]) => (
                <button
                  key={key}
                  style={{
                    ...styles.themeOption,
                    ...(theme === key ? styles.themeOptionActive : {}),
                  }}
                  onClick={() => {
                    setTheme(key);
                    setShowThemePicker(false);
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            style={styles.iconBtn}
            onClick={() => setShowThemePicker((s) => !s)}
            title="Theme badlo"
          >
            {THEME_META[theme]?.icon || "🎨"}
          </button>
        </div>
        <button
          style={styles.iconBtn}
          onClick={() => {
            if (window.confirm("Kya aap logout karna chahte hain?")) {
              logout();
            }
          }}
          title="Logout"
        >
          ⏻
        </button>
      </div>
    </div>
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
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    fontSize: 14,
    marginBottom: 22,
    flexShrink: 0,
  },
  items: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  item: {
    width: 52,
    background: "transparent",
    border: "none",
    borderRadius: 10,
    padding: "8px 4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    color: "var(--rail-text)",
  },
  itemActive: {
    background: "var(--rail-active-bg)",
    color: "#fff",
  },
  icon: { fontSize: 18 },
  label: { fontSize: 10, fontWeight: 600 },
  bottomActions: { display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 },
  iconBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--rail-text)",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 13,
  },
  themePopover: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    boxShadow: "var(--shadow-soft)",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 120,
    zIndex: 40,
  },
  themeOption: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    borderRadius: 6,
    padding: "7px 8px",
    fontSize: 12.5,
    textAlign: "left",
    width: "100%",
  },
  themeOptionActive: {
    background: "var(--accent-soft)",
    fontWeight: 700,
    color: "var(--accent)",
  },
};
