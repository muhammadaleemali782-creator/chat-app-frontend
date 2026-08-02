import { useState, useEffect } from "react";
import api from "../api";

const MAX_YEAR = new Date().getFullYear() + 3;

export default function ScheduleMeetingModal({ onClose, onScheduled }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [callType, setCallType] = useState("video");
  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?username=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
      } catch (err) {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!date || !time || !selectedUser) {
      setConflict(null);
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime())) {
      setConflict(null);
      return;
    }
    const t = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await api.post("/meetings/check-conflict", {
          otherUserId: selectedUser._id,
          scheduledAt: scheduledAt.toISOString(),
          duration,
        });
        setConflict(res.data.conflict ? res.data.meeting : null);
      } catch (err) {
        setConflict(null);
      } finally {
        setCheckingConflict(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [date, time, duration, selectedUser]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedUser) {
      setError("Pehle kisi ko select karo");
      return;
    }
    if (!title.trim() || !date || !time) {
      setError("Title, date aur time sab bharo");
      return;
    }
    const yearPart = Number(date.split("-")[0]);
    if (yearPart > MAX_YEAR || yearPart < new Date().getFullYear()) {
      setError("Date mein galat saal daala gaya hai");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime())) {
      setError("Ye date/time sahi nahi hai");
      return;
    }
    if (scheduledAt < new Date()) {
      setError("Guzra hua time select nahi kar sakte");
      return;
    }

    setLoading(true);
    try {
      // Pehle conversation dhoondo ya bana lo, phir usi mein meeting schedule karo
      const convRes = await api.post("/conversations/start", { otherUserId: selectedUser._id });
      await api.post("/meetings", {
        conversationId: convRes.data._id,
        title: title.trim(),
        scheduledAt: scheduledAt.toISOString(),
        callType,
        duration,
      });
      onScheduled?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>📅 Nayi Meeting Schedule Karo</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSchedule}>
          <label style={styles.label}>Kiske saath?</label>
          {!selectedUser ? (
            <>
              <input
                style={styles.input}
                placeholder="Username se dhundo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {results.length > 0 && (
                <div style={styles.resultsList}>
                  {results.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      style={styles.resultItem}
                      onClick={() => {
                        setSelectedUser(u);
                        setQuery("");
                        setResults([]);
                      }}
                    >
                      {u.displayName} <span style={{ color: "var(--text-faint)" }}>@{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.selectedUserPill}>
              {selectedUser.displayName} (@{selectedUser.username})
              <button
                type="button"
                style={styles.selectedUserClear}
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>
          )}

          <label style={styles.label}>Meeting ka naam</label>
          <input
            style={styles.input}
            placeholder="jaise: Project discussion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date</label>
              <input
                style={styles.input}
                type="date"
                value={date}
                max={`${MAX_YEAR}-12-31`}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Time</label>
              <input
                style={styles.input}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <label style={styles.label}>Kitni der ki meeting hai</label>
          <div style={styles.row}>
            {[15, 30, 45, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                style={{ ...styles.durationBtn, ...(duration === d ? styles.durationBtnActive : {}) }}
                onClick={() => setDuration(d)}
              >
                {d < 60 ? `${d}m` : `${d / 60}h`}
              </button>
            ))}
          </div>

          {checkingConflict && <div style={styles.checkingText}>Clash check ho raha hai...</div>}
          {conflict && (
            <div style={styles.conflictWarning}>
              🔴 Is waqt {selectedUser?.displayName} ke saath pehle se meeting hai:{" "}
              <strong>
                {new Date(conflict.scheduledAt).toLocaleString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>{" "}
              ({conflict.title}). Alag time try karo.
            </div>
          )}

          <label style={styles.label}>Call ka type</label>
          <div style={styles.row}>
            <button
              type="button"
              style={{ ...styles.typeBtn, ...(callType === "video" ? styles.durationBtnActive : {}) }}
              onClick={() => setCallType("video")}
            >
              🎥 Video
            </button>
            <button
              type="button"
              style={{ ...styles.typeBtn, ...(callType === "audio" ? styles.durationBtnActive : {}) }}
              onClick={() => setCallType("audio")}
            >
              📞 Audio
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button className="primary-btn" style={styles.submitBtn} disabled={loading}>
            {loading ? "Schedule ho raha hai..." : "Meeting schedule karo"}
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
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 6,
    maxHeight: 140,
    overflowY: "auto",
  },
  resultItem: {
    textAlign: "left",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    color: "var(--text)",
  },
  selectedUserPill: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--accent-soft)",
    border: "1px solid var(--accent)",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13.5,
    color: "var(--accent)",
    fontWeight: 600,
  },
  selectedUserClear: { background: "transparent", border: "none", color: "var(--accent)", fontSize: 13 },
  row: { display: "flex", gap: 8 },
  durationBtn: {
    flex: 1,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "9px 4px",
    color: "var(--text-muted)",
    fontSize: 12.5,
    fontWeight: 600,
  },
  durationBtnActive: {
    background: "var(--accent-soft)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  typeBtn: {
    flex: 1,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 8px",
    color: "var(--text-muted)",
    fontSize: 13.5,
    fontWeight: 600,
  },
  checkingText: { fontSize: 11.5, color: "var(--text-faint)", marginTop: 4 },
  conflictWarning: {
    background: "rgba(240,98,95,0.12)",
    border: "1px solid rgba(240,98,95,0.3)",
    color: "var(--danger)",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.5,
    marginTop: 6,
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
