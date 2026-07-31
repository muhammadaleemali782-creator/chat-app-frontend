import { useState, useEffect } from "react";
import api from "../api";

const MAX_YEAR = new Date().getFullYear() + 3; // 3 saal se aage schedule nahi kar sakte (galti se bade number type hone se bachata hai)

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

    const yearPart = Number(date.split("-")[0]);
    if (yearPart > MAX_YEAR || yearPart < new Date().getFullYear()) {
      setError("Date mein galat saal daala gaya hai, dobara check karo");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime())) {
      setError("Ye date/time sahi nahi hai, dobara try karo");
      return;
    }
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
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
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
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>📅 Meetings</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body} className="meeting-modal-body">
          <div style={styles.leftCol}>
            <div style={styles.sectionLabel}>Naya meeting schedule karo</div>
            <form style={styles.form} onSubmit={handleSchedule}>
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

              <label style={styles.label}>Call ka type</label>
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

          <div style={styles.rightCol}>
            <div style={styles.sectionLabel}>Upcoming meetings</div>
            <div style={styles.meetingsList}>
              {meetings.length === 0 && (
                <div style={styles.emptyText}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🗓️</div>
                  Koi meeting schedule nahi hai
                </div>
              )}
              {meetings.map((m) => (
                <div key={m._id} style={styles.meetingItem}>
                  <div style={styles.meetingIcon}>
                    {m.callType === "video" ? "🎥" : "🎙️"}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={styles.meetingTitle}>{m.title}</div>
                    <div style={styles.meetingTime}>{formatMeetingTime(m.scheduledAt)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="primary-btn"
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
                </div>
              ))}
            </div>
          </div>
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
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 640,
    maxHeight: "85vh",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-soft)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 22px",
    borderBottom: "1px solid var(--border)",
  },
  modalTitle: { fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)" },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 14,
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 0,
    overflow: "hidden",
    flex: 1,
    minHeight: 0,
  },
  leftCol: {
    padding: "20px 22px",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    minHeight: 0,
  },
  rightCol: {
    padding: "20px 22px",
    overflowY: "auto",
    minHeight: 0,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: 14,
  },
  form: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "var(--text-muted)", marginTop: 8 },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 14,
  },
  row: { display: "flex", gap: 10 },
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
  typeBtnActive: {
    background: "var(--accent-soft)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12.5,
    marginTop: 6,
  },
  scheduleBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 14.5,
    fontWeight: 600,
    marginTop: 14,
  },
  meetingsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyText: {
    color: "var(--text-faint)",
    fontSize: 13,
    padding: "30px 10px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  meetingItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
  },
  meetingIcon: { fontSize: 20 },
  meetingTitle: { fontSize: 14, fontWeight: 600 },
  meetingTime: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 },
  joinBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-faint)",
    fontSize: 13,
    width: 30,
    borderRadius: 8,
  },
};
