import { useState, useEffect } from "react";
import api from "../api";
import { avatarColor } from "../utils/avatarColor";

export default function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/users/search", { params: { username: query } });
        setResults(res.data.filter((u) => !selected.some((s) => s._id === u._id)));
      } catch (err) {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selected]);

  const addUser = (u) => {
    setSelected((prev) => [...prev, u]);
    setQuery("");
    setResults([]);
  };

  const removeUser = (id) => setSelected((prev) => prev.filter((u) => u._id !== id));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Group ka naam do");
      return;
    }
    if (selected.length === 0) {
      setError("Kam se kam ek member add karo");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/groups", {
        name: name.trim(),
        participantIds: selected.map((u) => u._id),
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Group nahi ban paya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>👥 Naya Group Banao</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form style={styles.form} onSubmit={handleCreate}>
          <label style={styles.label}>Group ka naam</label>
          <input
            style={styles.input}
            placeholder="jaise: Office Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label style={styles.label}>Members add karo (koi limit nahi hai)</label>
          {selected.length > 0 && (
            <div style={styles.selectedList}>
              {selected.map((u) => (
                <div key={u._id} style={styles.selectedPill}>
                  {u.displayName}
                  <button
                    type="button"
                    style={styles.selectedPillClose}
                    onClick={() => removeUser(u._id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            style={styles.input}
            placeholder="Username se dhundo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div style={styles.resultsList}>
              {results.map((u) => {
                const c = avatarColor(u.displayName);
                return (
                  <button
                    key={u._id}
                    type="button"
                    style={styles.resultItem}
                    onClick={() => addUser(u)}
                  >
                    <span
                      style={{
                        ...styles.resultAvatar,
                        background: c.bg,
                        color: c.fg,
                      }}
                    >
                      {u.displayName.charAt(0).toUpperCase()}
                    </span>
                    {u.displayName} <span style={{ color: "var(--text-faint)" }}>@{u.username}</span>
                  </button>
                );
              })}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button className="primary-btn" style={styles.submitBtn} disabled={loading}>
            {loading ? "Ban raha hai..." : `Group banao (${selected.length} members)`}
          </button>
        </form>
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
    maxHeight: "90vh",
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
  form: { display: "flex", flexDirection: "column", gap: 6, padding: "18px 20px" },
  label: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 14,
  },
  selectedList: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  selectedPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "var(--accent-soft)",
    color: "var(--accent)",
    borderRadius: 20,
    padding: "5px 6px 5px 12px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  selectedPillClose: { background: "transparent", border: "none", color: "var(--accent)", fontSize: 11 },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 6,
    maxHeight: 160,
    overflowY: "auto",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 13,
    color: "var(--text)",
  },
  resultAvatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12.5,
    marginTop: 6,
  },
  submitBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 12px",
    fontSize: 14.5,
    fontWeight: 600,
    marginTop: 14,
  },
};
