import { useState, useEffect, useRef, useMemo } from "react";
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
    conv.participants.find((p) => (p._id || p) !== user.id) || conv.participants[0];

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  // Split conversations into Groups and Direct/Person
  const { groupConvs, directConvs } = useMemo(() => {
    const groups = [];
    const directs = [];
    (conversations || []).forEach((c) => {
      if (c.type === "group") groups.push(c);
      else directs.push(c);
    });
    return { groupConvs: groups, directConvs: directs };
  }, [conversations]);

  return (
    <div style={styles.wrap} className="sidebar-floating-card">
      {/* 1. Top Search Bar & Create Group CTA */}
      <div style={styles.topHeader}>
        <div style={styles.searchBox}>
          <input
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            style={styles.searchIconBtn}
            onClick={() => searchInputRef.current?.focus()}
            title="Search"
          >
            🔍
          </button>
        </div>

        <button
          type="button"
          style={styles.newGroupPillBtn}
          onClick={() => setShowCreateGroup(true)}
          title="Naya group banao"
        >
          + Group
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

      {/* Live Search Results Dropdown */}
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
                <Avatar name={r.displayName} online={isOnline(r._id)} color={c} size={34} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={styles.resultName}>{r.displayName}</div>
                  <div style={styles.resultUsername}>@{r.username}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Scrollable Sections (Group & Person) */}
      <div style={styles.list}>
        {loading && <LoadingScreen message="Chats load ho rahi hain..." />}

        {!loading && conversations.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>
              Koi chat nahi hai abhi
            </strong>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Upar Search se username dhoond ke direct message shuru karo.
            </span>
          </div>
        )}

        {/* SECTION 1: GROUPS */}
        {groupConvs.length > 0 && (
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeaderRow}>
              <span style={styles.sectionTitle}>Group</span>
              <span style={styles.sectionSubCount}>{groupConvs.length}</span>
            </div>
            <div style={styles.convGroup}>
              {groupConvs.map((conv) => {
                const isActive = conv._id === activeId;
                return (
                  <div
                    key={conv._id}
                    className={`conv-item ${isActive ? "active-conv" : ""}`}
                    style={{
                      ...styles.convItem,
                      background: isActive ? "var(--surface-hover, #EFF6FF)" : "transparent",
                      borderLeft: isActive ? "4px solid #8B5CF6" : "4px solid transparent",
                    }}
                    onClick={() => onSelect(conv)}
                  >
                    <GroupAvatar name={conv.name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.convHeaderRow}>
                        <span style={styles.convName}>{conv.name}</span>
                        <span style={styles.convTime}>
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <div style={styles.convLastMsg}>
                        {conv.lastMessage || `${conv.participants?.length || 0} members`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: PERSON / DIRECT CHATS */}
        {directConvs.length > 0 && (
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeaderRow}>
              <span style={styles.sectionTitle}>Person</span>
              <span style={styles.sectionSubCount}>{directConvs.length}</span>
            </div>
            <div style={styles.convGroup}>
              {directConvs.map((conv) => {
                const other = otherParticipant(conv);
                if (!other) return null;
                const c = avatarColor(other.displayName || "User");
                const isActive = conv._id === activeId;
                const online = isOnline(other._id);

                return (
                  <div
                    key={conv._id}
                    className={`conv-item ${isActive ? "active-conv" : ""}`}
                    style={{
                      ...styles.convItem,
                      background: isActive ? "var(--surface-hover, #EFF6FF)" : "transparent",
                      borderLeft: isActive ? "4px solid #EC4899" : "4px solid transparent",
                    }}
                    onClick={() => onSelect(conv)}
                  >
                    <Avatar name={other.displayName} online={online} color={c} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.convHeaderRow}>
                        <span style={styles.convName}>{other.displayName}</span>
                        <span style={styles.convTime}>
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <div style={styles.convLastMsg}>
                        {conv.lastMessage || "Chat shuru karo..."}
                      </div>
                    </div>

                    <button
                      type="button"
                      style={styles.deleteBtn}
                      className="conv-delete-btn"
                      title="Delete chat"
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
          </div>
        )}
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
  const words = (name || "G").split(" ");
  const initial =
    words.length > 1
      ? `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      : (name || "G").slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontFamily: "var(--font-display)",
        fontSize: size * 0.36,
        letterSpacing: "0.04em",
        boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
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
    overflow: "hidden",
    position: "relative",
  },
  topHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 16px 12px",
    borderBottom: "1px solid var(--border-soft, #EEF2FF)",
  },
  searchBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    background: "var(--surface-2, #F8FAFC)",
    border: "1px solid var(--border, #E2E8F0)",
    borderRadius: 22,
    padding: "2px 6px 2px 14px",
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
  searchIconBtn: {
    background: "transparent",
    border: "none",
    fontSize: 12,
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "4px 6px",
  },
  newGroupPillBtn: {
    background: "var(--accent-soft, rgba(79, 70, 229, 0.1))",
    color: "var(--accent, #4F46E5)",
    border: "none",
    borderRadius: 20,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  resultsDropdown: {
    position: "absolute",
    top: 64,
    left: 16,
    right: 16,
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
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    padding: "30px 16px",
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  sectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px 4px",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "var(--text, #0F172A)",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.01em",
  },
  sectionSubCount: {
    fontSize: 11,
    color: "var(--text-muted)",
    background: "var(--surface-2)",
    padding: "1px 6px",
    borderRadius: 10,
    fontWeight: 700,
  },
  convGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.12s ease",
  },
  convHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convName: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text, #0F172A)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convTime: {
    fontSize: 10.5,
    color: "var(--text-faint, #94A3B8)",
    fontWeight: 500,
    marginLeft: 4,
    flexShrink: 0,
  },
  convLastMsg: {
    fontSize: 11.5,
    color: "var(--text-muted, #64748B)",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12,
    padding: 2,
    cursor: "pointer",
    opacity: 0,
    transition: "opacity 0.15s ease",
  },
};
