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
  const searchInputRef = useRef(null);
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

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={styles.wrap} className="sidebar-floating-card">
      {/* 1. Top Section: + Create New Floating Pill Button */}
      <div style={styles.topActionArea}>
        <button
          type="button"
          style={styles.createNewBtn}
          onClick={() => setShowCreateGroup(true)}
          title="Naya group ya chat shuru karo"
        >
          <span style={styles.plusIcon}>+</span>
          <span style={styles.createNewText}>Create New</span>
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

      {/* 2. Section Header: "Chat" with minimize/options indicator */}
      <div style={styles.chatSectionHeader}>
        <span style={styles.chatTitle}>Chat</span>
        <span style={styles.chatOptionsIcon}>—</span>
      </div>

      {/* 3. Modern Pill Search Input */}
      <div style={styles.searchBox}>
        <div style={styles.searchInputWrap}>
          <input
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search Contact..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            style={styles.searchIconPill}
            onClick={() => searchInputRef.current?.focus()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Live Search Dropdown */}
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

      {/* 4. Conversation List */}
      <div style={styles.list}>
        {loading && <LoadingScreen message="Chats load ho rahi hain..." />}
        {!loading && conversations.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>
              Koi chat nahi hai abhi
            </strong>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Upar diye "+ Create New" ya Search se direct chat shuru karo.
            </span>
          </div>
        )}

        {conversations.map((conv) => {
          const isGroup = conv.type === "group";
          const other = isGroup ? null : otherParticipant(conv);
          if (!isGroup && !other) return null;
          const c = isGroup ? null : avatarColor(other.displayName);
          const isActive = conv._id === activeId;
          const title = isGroup ? conv.name : other.displayName;
          const online = isGroup ? false : isOnline(other._id);
          const subtitle = isGroup
            ? `${conv.participants.length} members`
            : conv.lastMessage || "Chat shuru karo...";

          return (
            <div
              key={conv._id}
              className={`conv-item ${isActive ? "active-conv" : ""}`}
              style={{
                ...styles.convItem,
                background: isActive ? "#FFFFFF" : "transparent",
                border: isActive ? "1px solid var(--border-soft, #EEF2FF)" : "1px solid transparent",
                borderLeft: isActive ? "4px solid #FF4B72" : "4px solid transparent",
                boxShadow: isActive ? "0 8px 24px rgba(37, 99, 235, 0.08)" : "none",
              }}
              onClick={() => onSelect(conv)}
            >
              {isGroup ? (
                <GroupAvatar name={conv.name} size={42} />
              ) : (
                <Avatar name={other.displayName} online={online} color={c} size={42} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.convHeaderRow}>
                  <span style={styles.convName}>
                    {isGroup && "👥 "}
                    {title}
                  </span>
                  <span style={styles.convTime}>
                    {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                  </span>
                </div>
                <div style={styles.convLastMsg}>
                  {online && !isGroup && <span style={styles.onlineText}>Active now · </span>}
                  {subtitle}
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

      {/* Footer Branding */}
      <div style={styles.footerWrap}>
        <span style={styles.footerBrand}>Chatox Workspace</span>
      </div>
    </div>
  );
}

export function Avatar({ name, online, color, size = 40 }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background: color.bg,
        color: color.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontFamily: "var(--font-display)",
        fontSize: size * 0.4,
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}
    >
      {initial}
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: Math.max(10, size * 0.28),
            height: Math.max(10, size * 0.28),
            borderRadius: "50%",
            background: "#10b981",
            border: "2px solid var(--surface, #ffffff)",
          }}
        />
      )}
    </div>
  );
}

export function GroupAvatar({ name, size = 40 }) {
  const initial = (name || "G").charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontFamily: "var(--font-display)",
        fontSize: size * 0.4,
        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "var(--surface, #ffffff)",
    borderRight: "1px solid var(--border, #e2e8f0)",
    borderRadius: "24px 0 0 24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  topActionArea: {
    padding: "20px 18px 12px",
  },
  createNewBtn: {
    width: "100%",
    background: "var(--surface, #ffffff)",
    color: "var(--text, #1E293B)",
    border: "1px solid var(--border, #E2E8F0)",
    borderRadius: 28,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 4px 18px rgba(37, 99, 235, 0.09)",
    transition: "all 0.18s ease",
  },
  plusIcon: {
    fontSize: 18,
    lineHeight: 1,
    color: "#2563EB",
    fontWeight: 900,
  },
  createNewText: {
    letterSpacing: "-0.01em",
  },
  chatSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 22px 10px",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 900,
    fontFamily: "var(--font-display)",
    color: "var(--text, #1E293B)",
    letterSpacing: "-0.02em",
  },
  chatOptionsIcon: {
    color: "var(--text-muted, #64748B)",
    fontSize: 14,
    fontWeight: 700,
  },
  searchBox: {
    padding: "0 18px 14px",
    position: "relative",
  },
  searchInputWrap: {
    display: "flex",
    alignItems: "center",
    background: "var(--surface-2, #F8FAFC)",
    border: "1px solid var(--border, #E2E8F0)",
    borderRadius: 24,
    padding: "4px 6px 4px 16px",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: 13,
    padding: "8px 0",
  },
  searchIconPill: {
    background: "var(--surface, #ffffff)",
    border: "1px solid var(--border, #E2E8F0)",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  resultsDropdown: {
    position: "absolute",
    top: "calc(100% - 6px)",
    left: 18,
    right: 18,
    background: "var(--surface, #ffffff)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
    zIndex: 40,
    maxHeight: 260,
    overflowY: "auto",
    padding: 6,
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.12s ease",
  },
  resultName: { fontSize: 13, fontWeight: 700, color: "var(--text)" },
  resultUsername: { fontSize: 11, color: "var(--text-muted)" },
  resultItemMuted: {
    padding: 14,
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 12.5,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "0 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    padding: "30px 16px",
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.15s ease",
    position: "relative",
  },
  convHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convName: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convTime: {
    fontSize: 10.5,
    color: "var(--text-faint)",
    fontWeight: 500,
    marginLeft: 4,
    flexShrink: 0,
  },
  convLastMsg: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  onlineText: {
    color: "#10B981",
    fontWeight: 600,
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 13,
    padding: 4,
    cursor: "pointer",
    opacity: 0,
    transition: "opacity 0.15s ease",
  },
  footerWrap: {
    padding: "10px 18px",
    borderTop: "1px solid var(--border-soft)",
    textAlign: "center",
  },
  footerBrand: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontWeight: 600,
  },
};
