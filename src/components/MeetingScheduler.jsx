import { useState, useEffect } from "react";
import api from "../api";

export default function MeetingScheduler({ conversationId, onStartCall, onClose }) {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [callType, setCallType] = useState("video");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMeetings = async () => {
    try {
      const res = await api.get(`/meetings/${conversationId}`);
      setMeetings(res.data.filter((m) => m.status === "upcoming"));
    } catch (err) {
      // chup chaap fail hone do, list khali dikhegi
    }
  };

  useEffect(() => {
    loadMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !date || !time) {
      setError("Title, date aur time sab bharo");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < new Date()) {
      setError("Guzra hua time select nahi kar sakte");
      return;
    }
    setLoading(true);
    try {
      await api.post("/meetings", {
        conversationId,
        title: title.trim(),
        scheduledAt: scheduledAt.toISOString(),
        callType,
      });
      setTitle("");
      setDate("");
      setTime("");
      await loadMeetings();
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/meetings/${id}`);
      await loadMeetings();
    } catch (err) {
      // ignore
    }
  };

  const formatMeetingTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>📅 Meetings</span>
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={styles.meetingsList}>
        {meetings.length === 0 && (
          <div style={styles.emptyText}>Koi meeting schedule nahi hai</div>
        )}
        {meetings.map((m) => (
          <div key={m._id} style={styles.meetingItem}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={styles.meetingTitle}>{m.title}</div>
              <div style={styles.meetingTime}>
                {formatMeetingTime(m.scheduledAt)} · {m.callType === "video" ? "🎥" : "🎙️"}
              </div>
            </div>
            <button
              style={styles.joinBtn}
              onClick={() => onStartCall(m.callType)}
              title="Abhi call karo"
            >
              Join
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => handleCancel(m._id)}
              title="Cancel karo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form style={styles.form} onSubmit={handleSchedule}>
        <input
          style={styles.input}
          placeholder="Meeting ka naam"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div style={styles.row}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            style={{ ...styles.input, flex: 1 }}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <button
            type="button"
            style={{
              ...styles.typeBtn,
              ...(callType === "video" ? styles.typeBtnActive : {}),
            }}
            onClick={() => setCallType("video")}
          >
            🎥 Video
          </button>
          <button
            type="button"
            style={{
              ...styles.typeBtn,
              ...(callType === "audio" ? styles.typeBtnActive : {}),
            }}
            onClick={() => setCallType("audio")}
          >
            🎙️ Audio
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <button className="primary-btn" style={styles.scheduleBtn} disabled={loading}>
          {loading ? "Schedule ho raha hai..." : "Meeting schedule karo"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  panel: {
    position: "absolute",
    top: "100%",
    right: 20,
    width: 300,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    boxShadow: "var(--shadow-soft)",
    zIndex: 20,
    maxHeight: 420,
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid var(--border)",
  },
  panelTitle: { fontSize: 14, fontWeight: 600 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  meetingsList: {
    maxHeight: 160,
    overflowY: "auto",
    padding: "6px 10px",
  },
  emptyText: {
    color: "var(--text-faint)",
    fontSize: 12.5,
    padding: "10px 4px",
    textAlign: "center",
  },
  meetingItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 4px",
    borderBottom: "1px solid var(--border-soft)",
  },
  meetingTitle: { fontSize: 13, fontWeight: 600 },
  meetingTime: { fontSize: 11.5, color: "var(--text-muted)" },
  joinBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11.5,
    fontWeight: 600,
  },
  cancelBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 13,
    padding: "0 4px",
  },
  form: {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderTop: "1px solid var(--border)",
  },
  row: { display: "flex", gap: 8 },
  input: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 12.5,
  },
  typeBtn: {
    flex: 1,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "6px 8px",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  typeBtnActive: {
    background: "var(--accent-soft)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 11.5,
  },
  scheduleBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 2,
  },
};
