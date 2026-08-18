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
      {/* 1. Header with App Title & New Group CTA */}
      <div style={styles.header}>
        <div className="wordmark" style={{ fontSize: 22, fontWeight: 900 }}>
          Chatox<span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <button
          type="button"
          style={styles.newGroupBtn}
          title="Naya group banao"
          onClick={() => setShowCreateGroup(true)}
        >
          <span>👥</span>
          <span>+ Group</span>
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

      {/* 2. Modern Search Input */}
      <div style={styles.searchBox}>
        <div style={styles.searchInputWrap}>
          <span style={styles.searchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            style={styles.searchInput}
            placeholder="Username se search karo..."
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
                  <Avatar name={r.displayName} online={isOnline(r._id)} color={c} size={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={styles.resultName}>{r.displayName}</div>
                    <div style={styles.resultUsername}>@{r.username}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Conversation List */}
      <div style={styles.list}>
        {loading && <LoadingScreen message="Chats load ho rahi hain..." />}
        {!loading && conversations.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>Koi chat nahi hai abhi</strong>
            <span>Upar se kisi ka username search karke direct chat shuru karo.</span>
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
              className={`conv-item ${isActive ? "active-conv" : ""}`}
              style={{
                ...styles.convItem,
                background: isActive ? "var(--surface-hover)" : "transparent",
                border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
              }}
              onClick={() => onSelect(conv)}
            >
              {isGroup ? (
                <GroupAvatar name={conv.name} size={42} />
              ) : (
                <Avatar name={other.displayName} online={isOnline(other._id)} color={c} size={42} />
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
                type="button"
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

      <div style={styles.brandFooter}>
        Powered by <strong>Educa Veda Digitals</strong>
      </div>
    </div>
  );
}

function Avatar({ name, online, color, size = 42 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const palette = color || { bg: "var(--accent-soft)", fg: "var(--accent)" };
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background: palette.bg,
          color: palette.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
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
        minWidth: size,
        minHeight: size,
        aspectRatio: "1 / 1",
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
    padding: "18px 18px 12px",
  },
  newGroupBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 10,
    padding: "6px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  searchBox: { position: "relative", padding: "4px 18px 12px" },
  searchInputWrap: { position: "relative" },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-faint)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "9px 12px 9px 36px",
    color: "var(--text)",
    fontSize: 13.5,
    outline: "none",
    boxSizing: "border-box",
  },
  resultsDropdown: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "calc(100% + 4px)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    overflow: "hidden",
    zIndex: 99,
    maxHeight: 260,
    overflowY: "auto",
    boxShadow: "var(--shadow)",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "1px solid var(--border-soft)",
  },
  resultItemMuted: {
    padding: "14px 12px",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  resultName: { fontSize: 13.5, fontWeight: 700, color: "var(--text)" },
  resultUsername: { fontSize: 12, color: "var(--text-muted)" },
  list: { flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 10px 8px" },
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
    padding: "40px 20px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  emptyIcon: { fontSize: 32, marginBottom: 8, opacity: 0.8 },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 12px",
    borderRadius: 14,
    cursor: "pointer",
    marginBottom: 4,
    transition: "all 0.15s ease",
  },
  convName: { fontSize: 14.5, fontWeight: 700, color: "var(--text)" },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 14,
    padding: "6px",
    flexShrink: 0,
    cursor: "pointer",
    opacity: 0.5,
  },
  convLastMsg: {
    fontSize: 12.5,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: 2,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: "#10b981",
    border: "2px solid var(--surface)",
  },
};

export { Avatar, GroupAvatar };
