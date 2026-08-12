import { useState, useEffect, useRef } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { usePresence } from "../context/PresenceContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import LoadingScreen from "./LoadingScreen.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onDeleteConversation,
  onGroupCreated,
  loading,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const debounceRef = useRef(null);
  const { user } = useAuth();
  const { isOnline } = usePresence();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/users/search", { params: { username: query } });
        setResults(res.data);
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handlePickUser = async (pickedUser) => {
    setQuery("");
    setResults([]);
    await onNewConversation(pickedUser);
  };

  const otherParticipant = (conv) =>
    conv.participants.find((p) => p._id !== user.id) || conv.participants[0];

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div className="wordmark" style={{ fontSize: 22 }}>
          Chat<span className="dot">.</span>
        </div>
        <button
          style={styles.newGroupBtn}
          title="Naya group banao"
          onClick={() => setShowCreateGroup(true)}
        >
          👥+
        </button>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(group) => {
            setShowCreateGroup(false);
            onGroupCreated?.(group);
          }}
        />
      )}

      <div style={styles.searchBox}>
        <div style={styles.searchInputWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            style={styles.searchInput}
            placeholder="Username se dhundo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query && (
          <div style={styles.resultsDropdown}>
            {searching && <div style={styles.resultItemMuted}>Dhoond rahe hain...</div>}
            {!searching && results.length === 0 && (
              <div style={styles.resultItemMuted}>Koi user nahi mila</div>
            )}
            {results.map((r) => {
              const c = avatarColor(r.displayName);
              return (
                <div
                  key={r._id}
                  className="result-item"
                  style={styles.resultItem}
                  onClick={() => handlePickUser(r)}
                >
                  <Avatar name={r.displayName} online={isOnline(r._id)} color={c} />
                  <div style={{ minWidth: 0 }}>
                    <div style={styles.resultName}>{r.displayName}</div>
                    <div style={styles.resultUsername}>@{r.username}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.list}>
        {loading && <LoadingScreen message="Chats load ho rahi hain..." />}
        {!loading && conversations.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            Koi chat nahi hai abhi.
            <br />
            Upar se kisi ka username dhundo aur baat shuru karo.
          </div>
        )}
        {conversations.map((conv) => {
          const isGroup = conv.type === "group";
          const other = isGroup ? null : otherParticipant(conv);
          if (!isGroup && !other) return null;
          const c = isGroup ? null : avatarColor(other.displayName);
          const isActive = conv._id === activeId;
          const title = isGroup ? conv.name : other.displayName;
          const subtitle = isGroup
            ? `${conv.participants.length} members`
            : conv.lastMessage || "Chat shuru karo...";
          return (
            <div
              key={conv._id}
              className="conv-item"
              style={{
                ...styles.convItem,
                background: isActive ? "var(--surface-hover)" : "transparent",
                boxShadow: isActive ? "inset 3px 0 0 var(--accent)" : "none",
              }}
              onClick={() => onSelect(conv)}
            >
              {isGroup ? (
                <GroupAvatar name={conv.name} />
              ) : (
                <Avatar name={other.displayName} online={isOnline(other._id)} color={c} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.convName}>
                  {isGroup && "👥 "}
                  {title}
                </div>
                <div style={styles.convLastMsg}>
                  {isGroup ? subtitle : conv.lastMessage || subtitle}
                </div>
              </div>
              <button
                style={styles.deleteBtn}
                className="conv-delete-btn"
                title="Chat delete karo"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation?.(conv);
                }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>

      <div style={styles.brandFooter}>Powered by Educa Veda Digitals</div>
    </div>
  );
}

function Avatar({ name, online, color, size = 42 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const palette = color || { bg: "var(--accent-soft)", fg: "var(--accent)" };
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: palette.bg,
          color: palette.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </div>
      {online && <div className="online-dot" style={styles.onlineDot} />}
    </div>
  );
}

function GroupAvatar({ name, size = 42 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      👥
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    borderRight: "1px solid var(--border)",
    background: "var(--surface)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 18px 12px",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 14,
  },
  newGroupBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 600,
  },
  searchBox: { position: "relative", padding: "6px 18px 14px" },
  searchInputWrap: { position: "relative" },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%) rotate(45deg)",
    color: "var(--text-faint)",
    fontSize: 15,
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px 10px 32px",
    color: "var(--text)",
    fontSize: 14,
  },
  resultsDropdown: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "calc(100% + 2px)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 10,
    maxHeight: 260,
    overflowY: "auto",
    boxShadow: "var(--shadow-soft)",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    cursor: "pointer",
  },
  resultItemMuted: {
    padding: "14px 12px",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  resultName: { fontSize: 14, fontWeight: 600 },
  resultUsername: { fontSize: 12, color: "var(--text-muted)" },
  list: { flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 8px 8px" },
  brandFooter: {
    textAlign: "center",
    fontSize: 11,
    color: "var(--text-faint)",
    padding: "10px 12px 14px",
    borderTop: "1px solid var(--border-soft)",
    letterSpacing: "0.02em",
  },
  emptyState: {
    color: "var(--text-muted)",
    fontSize: 13,
    padding: "36px 20px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  emptyIcon: { fontSize: 28, marginBottom: 10, opacity: 0.7 },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 2,
  },
  convName: { fontSize: 15, fontWeight: 600 },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 14,
    padding: "6px 4px",
    flexShrink: 0,
    opacity: 0.6,
  },
  convLastMsg: {
    fontSize: 13,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: "var(--amber)",
    border: "2px solid var(--surface)",
  },
};

export { Avatar, GroupAvatar };
