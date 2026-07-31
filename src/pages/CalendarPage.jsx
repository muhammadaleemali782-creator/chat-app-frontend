import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { avatarColor } from "../utils/avatarColor";

export default function CalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { startCall } = useCall();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/meetings");
      setMeetings(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    try {
      await api.delete(`/meetings/${id}`);
      load();
    } catch (err) {
      // ignore
    }
  };

  const handleJoin = (meeting) => {
    const other = meeting.conversation?.participants?.find((p) => p._id !== user.id);
    if (!other) return;
    startCall(other, meeting.conversation._id, meeting.callType);
  };

  const formatDay = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(d, today)) return "Aaj";
    if (sameDay(d, tomorrow)) return "Kal";
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Date ke hisaab se group karte hain
  const grouped = meetings.reduce((acc, m) => {
    const key = formatDay(m.scheduledAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Calendar</h1>
        <p style={styles.subtitle}>Apni saari scheduled meetings yaha dekho</p>
      </div>

      <div style={styles.content}>
        {loading && <div style={styles.emptyText}>Load ho raha hai...</div>}

        {!loading && meetings.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
            Koi meeting schedule nahi hai.
            <br />
            Kisi chat mein 📅 icon se meeting schedule kar sakte ho.
          </div>
        )}

        {Object.entries(grouped).map(([day, dayMeetings]) => (
          <div key={day} style={styles.dayGroup}>
            <div style={styles.dayLabel}>{day}</div>
            {dayMeetings.map((m) => {
              const other = m.conversation?.participants?.find((p) => p._id !== user.id);
              const color = avatarColor(other?.displayName || "");
              return (
                <div key={m._id} style={styles.meetingCard}>
                  <div style={styles.timeCol}>{formatTime(m.scheduledAt)}</div>
                  <div
                    style={{
                      ...styles.avatar,
                      background: color.bg,
                      color: color.fg,
                    }}
                  >
                    {(other?.displayName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.meetingTitle}>{m.title}</div>
                    <div style={styles.meetingMeta}>
                      {other?.displayName} ke saath · {m.callType === "video" ? "🎥 Video" : "🎙️ Audio"}
                    </div>
                  </div>
                  <button className="primary-btn" style={styles.joinBtn} onClick={() => handleJoin(m)}>
                    Join
                  </button>
                  <button style={styles.cancelBtn} onClick={() => handleCancel(m._id)} title="Cancel">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { height: "100%", overflowY: "auto", background: "var(--bg)" },
  header: { padding: "28px 32px 10px" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: { color: "var(--text-muted)", fontSize: 13.5, marginTop: 6 },
  content: { padding: "10px 32px 40px", maxWidth: 720 },
  emptyText: { color: "var(--text-muted)", fontSize: 14, padding: "20px 0" },
  emptyState: {
    color: "var(--text-muted)",
    fontSize: 14,
    textAlign: "center",
    padding: "60px 20px",
    lineHeight: 1.6,
  },
  dayGroup: { marginTop: 22 },
  dayLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: 10,
  },
  meetingCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 8,
  },
  timeCol: {
    fontSize: 12.5,
    color: "var(--text-muted)",
    minWidth: 52,
    fontWeight: 600,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    fontSize: 14,
    flexShrink: 0,
  },
  meetingTitle: { fontSize: 14.5, fontWeight: 600 },
  meetingMeta: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 },
  joinBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-faint)",
    borderRadius: 8,
    width: 30,
    height: 30,
    fontSize: 13,
  },
};
