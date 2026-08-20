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
      {/* Mobile-Only Asymmetric Organic S-Wave Header (100% Single Seamless Shape) */}
      <div className="mobile-wave-header-banner">
        <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
          <defs>
            <clipPath id="mobileWaveClip" clipPathUnits="objectBoundingBox">
              <path d="M 0,0 L 1,0 L 1,0.76 C 0.72,0.98 0.35,0.70 0,0.92 Z" />
            </clipPath>
          </defs>
        </svg>

        <div className="mobile-wave-top-bar">
          <span className="mobile-wave-title">Messages</span>
          <div className="mobile-wave-avatar" title={user?.displayName || "User"}>
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        <div className="mobile-wave-search-box">
          <span className="mobile-wave-search-icon">🔍</span>
          <input
            ref={searchInputRef}
            className="mobile-wave-search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>




      {/* Mobile-Only Recent Bar */}
      <div className="mobile-white-card">
        <div className="mobile-recent-bar">
          <span className="mobile-recent-heading">Recent</span>
          <button
            type="button"
            className="mobile-recent-menu-btn"
            onClick={() => setShowCreateGroup(true)}
            title="New Group / Options"
          >
            •••
          </button>
        </div>



        {/* Desktop Top Search Bar & Create Group CTA */}
        <div style={styles.topHeader} className="desktop-only-header">
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
              <strong style={{ display: "block", marginBottom: 4, color: "#0F172A" }}>
                Koi chat nahi hai abhi
              </strong>
              <span style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>
                Upar Search se username dhoond ke direct message shuru karo.
              </span>
            </div>
          )}

        {/* SECTION 1: GROUPS */}
        {groupConvs.length > 0 && (
          <div style={styles.sectionBlock} className="conv-section-block">
            <div style={styles.sectionHeaderRow} className="conv-section-header">
              <span style={styles.sectionTitle}>Group</span>
              <span style={styles.sectionSubCount}>{groupConvs.length}</span>
            </div>
            <div style={styles.convGroup}>
              {groupConvs.map((conv) => {
                const isActive = conv._id === activeId;
                return (
                  <div
                    key={conv._id}
                    className={`conv-item mobile-conv-item ${isActive ? "active-conv" : ""}`}
                    style={{
                      ...styles.convItem,
                      background: isActive ? "var(--surface-2, #F0F4FF)" : "transparent",
                    }}
                    onClick={() => onSelect(conv)}
                  >
                    <div className="conv-avatar-wrap">
                      <GroupAvatar name={conv.name} size={42} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }} className="conv-body-wrap">
                      <div style={styles.convHeaderRow} className="conv-title-row">
                        <span style={styles.convName} className="conv-person-name">{conv.name}</span>
                        <span style={styles.convTime} className="conv-time-text">
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <div className="conv-preview-row">
                        <span style={styles.convLastMsg} className="conv-preview-text">
                          {conv.lastMessage || `${conv.participants?.length || 0} members`}
                        </span>
                        {conv.unreadCount ? (
                          <span className="mobile-unread-badge">{conv.unreadCount}</span>
                        ) : null}
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
          <div style={styles.sectionBlock} className="conv-section-block">
            <div style={styles.sectionHeaderRow} className="conv-section-header">
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
                    className={`conv-item mobile-conv-item ${isActive ? "active-conv" : ""}`}
                    style={{
                      ...styles.convItem,
                      background: isActive ? "var(--surface-2, #FDF2F8)" : "transparent",
                    }}
                    onClick={() => onSelect(conv)}
                  >
                    <div className="conv-avatar-wrap">
                      <Avatar name={other.displayName} online={online} color={c} size={42} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }} className="conv-body-wrap">
                      <div style={styles.convHeaderRow} className="conv-title-row">
                        <span style={styles.convName} className="conv-person-name">{other.displayName}</span>
                        <span style={styles.convTime} className="conv-time-text">
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <div className="conv-preview-row">
                        <span style={styles.convLastMsg} className="conv-preview-text">
                          {conv.lastMessage || "Chat shuru karo..."}
                        </span>
                        {conv.unreadCount ? (
                          <span className="mobile-unread-badge">{conv.unreadCount}</span>
                        ) : null}
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
        )}{/* closes directConvs section */}

        </div>{/* closes styles.list */}
      </div>{/* closes mobile-white-card */}
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
            border: "2px solid #ffffff",
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
    background: "#FFFFFF",
    borderRight: "1px solid #F1F5F9",
    overflow: "hidden",
    position: "relative",
    borderRadius: "28px 0 0 28px",
  },
  topHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 16px 12px",
    borderBottom: "1px solid #F1F5F9",
    background: "#FFFFFF",
  },
  searchBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 22,
    padding: "2px 6px 2px 14px",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#0F172A",
    fontSize: 13,
    padding: "8px 0",
  },
  searchIconBtn: {
    background: "transparent",
    border: "none",
    fontSize: 12,
    color: "#64748B",
    cursor: "pointer",
    padding: "4px 6px",
  },
  newGroupPillBtn: {
    background: "rgba(79, 70, 229, 0.1)",
    color: "#4F46E5",
    border: "none",
    borderRadius: 20,
    padding: "7px 14px",
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
    background: "#ffffff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
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
  resultName: { fontSize: 13, fontWeight: 700, color: "#0F172A" },
  resultUsername: { fontSize: 11, color: "#64748B" },
  resultItemMuted: {
    padding: 14,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12.5,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#FFFFFF",
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
    color: "#0F172A",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.01em",
  },
  sectionSubCount: {
    fontSize: 11,
    color: "#64748B",
    background: "#F1F5F9",
    padding: "1px 7px",
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
    color: "#0F172A",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convTime: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: 500,
    marginLeft: 4,
    flexShrink: 0,
  },
  convLastMsg: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontSize: 12,
    padding: 2,
    cursor: "pointer",
    opacity: 0,
    transition: "opacity 0.15s ease",
  },
};
