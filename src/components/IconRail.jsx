import { useAuth } from "../context/AuthContext.jsx";
import { avatarColor } from "../utils/avatarColor";

// Teams-jaisa narrow icon sidebar - Chat / Calendar / Calls ke beech switch karne ke liye
export default function IconRail({ page, onPageChange }) {
  const { user, logout } = useAuth();
  const color = avatarColor(user?.displayName || "");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const items = [
    { key: "chat", icon: "💬", label: "Chat" },
    { key: "calendar", icon: "📅", label: "Calendar" },
    { key: "calls", icon: "📞", label: "Calls" },
  ];

  return (
    <div style={styles.rail}>
      <div
        style={{ ...styles.avatar, background: color.bg, color: color.fg }}
        title={user?.displayName}
      >
        {initial}
      </div>

      <div style={styles.items}>
        {items.map((item) => (
          <button
            key={item.key}
            style={{
              ...styles.item,
              ...(page === item.key ? styles.itemActive : {}),
            }}
            onClick={() => onPageChange(item.key)}
            title={item.label}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={logout} title="Logout">
        ⏻
      </button>
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
  logoutBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--rail-text)",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 13,
  },
};
