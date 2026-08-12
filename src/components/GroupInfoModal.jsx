import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import { GroupAvatar } from "./Sidebar.jsx";

export default function GroupInfoModal({ conversation, onClose, onUpdated, onLeft }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(conversation);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = group.admins?.some((a) => (a._id || a) === user.id);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/users/search", { params: { username: query } });
        const existingIds = new Set(group.participants.map((p) => p._id));
        setResults(res.data.filter((u) => !existingIds.has(u._id)));
      } catch (err) {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, group.participants]);

  const refresh = (updated) => {
    setGroup(updated);
    onUpdated?.(updated);
  };

  const handleAddMember = async (u) => {
    setBusy(true);
    setError("");
    try {
      const res = await api.post(`/groups/${group._id}/members`, { userIds: [u._id] });
      refresh(res.data);
      setQuery("");
      setResults([]);
    } catch (err) {
      setError(err.response?.data?.message || "Add nahi ho paya");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`${memberName} ko group se nikaalna hai?`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.delete(`/groups/${group._id}/members/${memberId}`);
      refresh(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Nikal nahi paya");
    } finally {
      setBusy(false);
    }
  };

  const handlePromote = async (memberId, memberName) => {
    if (!window.confirm(`${memberName} ko admin banana hai?`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.post(`/groups/${group._id}/admins/${memberId}`);
      refresh(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Admin nahi bana paya");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleAdminOnly = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.put(`/groups/${group._id}`, {
        onlyAdminsCanMessage: !group.onlyAdminsCanMessage,
      });
      refresh(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Badal nahi paya");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Kya aap is group ko chhodna chahte hain?")) return;
    setBusy(true);
    try {
      await api.delete(`/groups/${group._id}/members/${user.id}`);
      onLeft?.();
    } catch (err) {
      setError(err.response?.data?.message || "Chhod nahi paye");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>Group Info</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.groupHead}>
            <GroupAvatar name={group.name} size={56} />
            <div style={styles.groupName}>👥 {group.name}</div>
            <div style={styles.groupSub}>{group.participants.length} members</div>
          </div>

          {isAdmin && (
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Sirf admin message bhej sakte hain</div>
                <div style={styles.settingSub}>Announcement-style group ke liye</div>
              </div>
              <button
                style={{
                  ...styles.toggleBtn,
                  ...(group.onlyAdminsCanMessage ? styles.toggleBtnOn : {}),
                }}
                onClick={handleToggleAdminOnly}
                disabled={busy}
              >
                {group.onlyAdminsCanMessage ? "ON" : "OFF"}
              </button>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.membersHeader}>
            <span>Members ({group.participants.length})</span>
            {isAdmin && (
              <button style={styles.addBtn} onClick={() => setShowAddMembers((v) => !v)}>
                + Add
              </button>
            )}
          </div>

          {showAddMembers && (
            <div style={styles.addMembersBox}>
              <input
                style={styles.input}
                placeholder="Username se dhundo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {results.map((u) => (
                <button
                  key={u._id}
                  style={styles.resultItem}
                  onClick={() => handleAddMember(u)}
                  disabled={busy}
                >
                  + {u.displayName} <span style={{ color: "var(--text-faint)" }}>@{u.username}</span>
                </button>
              ))}
            </div>
          )}

          <div style={styles.membersList}>
            {group.participants.map((p) => {
              const memberIsAdmin = group.admins?.some((a) => (a._id || a) === p._id);
              const c = avatarColor(p.displayName);
              return (
                <div key={p._id} style={styles.memberRow}>
                  <span
                    style={{ ...styles.memberAvatar, background: c.bg, color: c.fg }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.memberName}>
                      {p.displayName} {p._id === user.id && "(Aap)"}
                    </div>
                    {memberIsAdmin && <div style={styles.adminBadge}>Admin</div>}
                  </div>
                  {isAdmin && p._id !== user.id && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {!memberIsAdmin && (
                        <button
                          style={styles.memberActionBtn}
                          onClick={() => handlePromote(p._id, p.displayName)}
                          disabled={busy}
                        >
                          Admin banao
                        </button>
                      )}
                      <button
                        style={{ ...styles.memberActionBtn, color: "var(--danger)" }}
                        onClick={() => handleRemoveMember(p._id, p.displayName)}
                        disabled={busy}
                      >
                        Nikaalo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button style={styles.leaveBtn} onClick={handleLeave} disabled={busy}>
            🚪 Group Chhodo
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,8,14,0.6)",
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-soft)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  headerTitle: { fontSize: 15.5, fontWeight: 700, fontFamily: "var(--font-display)" },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 28,
    height: 28,
    borderRadius: "50%",
  },
  body: { padding: "20px", display: "flex", flexDirection: "column", gap: 6 },
  groupHead: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 10 },
  groupName: { fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" },
  groupSub: { fontSize: 12.5, color: "var(--text-muted)" },
  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: "var(--surface-2)",
    borderRadius: 12,
    padding: "10px 14px",
    marginBottom: 8,
  },
  settingLabel: { fontSize: 13, fontWeight: 600 },
  settingSub: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  toggleBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 11.5,
    fontWeight: 700,
    color: "var(--text-muted)",
    flexShrink: 0,
  },
  toggleBtnOn: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12.5,
  },
  membersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12.5,
    color: "var(--text-muted)",
    fontWeight: 600,
    marginTop: 8,
  },
  addBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  addMembersBox: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "var(--surface-2)",
    borderRadius: 10,
    padding: 8,
  },
  input: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 13,
  },
  resultItem: {
    textAlign: "left",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 12.5,
    color: "var(--text)",
  },
  membersList: { display: "flex", flexDirection: "column", gap: 4, marginTop: 6 },
  memberRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  memberName: { fontSize: 13.5, fontWeight: 600 },
  adminBadge: { fontSize: 10.5, color: "var(--accent)", fontWeight: 700, marginTop: 1 },
  memberActionBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 11,
    color: "var(--text)",
    whiteSpace: "nowrap",
  },
  leaveBtn: {
    marginTop: 16,
    background: "rgba(240,98,95,0.1)",
    border: "1px solid rgba(240,98,95,0.3)",
    color: "var(--danger)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13.5,
    fontWeight: 600,
  },
};
