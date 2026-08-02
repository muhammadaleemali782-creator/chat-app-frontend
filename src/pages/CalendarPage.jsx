import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import LoadingScreen from "../components/LoadingScreen.jsx";
import ScheduleMeetingModal from "../components/ScheduleMeetingModal.jsx";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_MS = 24 * 60 * 60 * 1000;

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatHour = (h) => {
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${period}`;
};

export default function CalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();
  const { startCall } = useCall();
  const timelineRef = useRef(null);
  const scrolledOnceRef = useRef(false);

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

  // Live ghadi - har 30 second me time refresh, taaki "abhi kitne baje hai" hamesha sahi dikhe
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Yeh meeting cancel karni hai?")) return;
    const reason = window.prompt("Cancel karne ki wajah kya hai? (khali bhi chhod sakte ho)", "");
    if (reason === null) return;
    try {
      await api.delete(`/meetings/${id}`, { data: { reason } });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Meeting cancel nahi ho payi, dobara try karo");
    }
  };

  const handleJoin = (meeting) => {
    const other = meeting.conversation?.participants?.find((p) => p._id !== user.id);
    if (!other) return;
    startCall(other, meeting.conversation._id, meeting.callType);
  };

  // Agle 7 dino ki list (aaj se shuru)
  const weekDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * DAY_MS));
  }, []);

  const meetingsByDayKey = useMemo(() => {
    const map = {};
    meetings.forEach((m) => {
      const d = new Date(m.scheduledAt);
      const key = startOfDay(d).getTime();
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
    return map;
  }, [meetings]);

  const selectedMeetings = meetingsByDayKey[selectedDay.getTime()] || [];
  const isSelectedToday = sameDay(selectedDay, now);

  const dayLabel = (d) => {
    if (sameDay(d, now)) return "Aaj";
    if (sameDay(d, new Date(startOfDay(now).getTime() + DAY_MS))) return "Kal";
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const currentHour = now.getHours();
  const currentMinuteFraction = now.getMinutes() / 60;

  // Timeline pehli baar khulte hi current time ke aas-paas scroll ho jaaye
  useEffect(() => {
    if (isSelectedToday && timelineRef.current && !scrolledOnceRef.current) {
      const rowHeight = 56;
      timelineRef.current.scrollTop = Math.max(0, (currentHour - 2) * rowHeight);
      scrolledOnceRef.current = true;
    }
  }, [isSelectedToday, currentHour]);

  // Aaj aur kal ki meetings ka quick summary
  const todayCount = (meetingsByDayKey[startOfDay(now).getTime()] || []).length;
  const tomorrowCount =
    (meetingsByDayKey[startOfDay(new Date(now.getTime() + DAY_MS)).getTime()] || []).length;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Calendar</h1>
          <div style={styles.liveClock}>
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            <span style={styles.liveTime}>
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div style={styles.summaryPills}>
          <div style={styles.pill}>
            <strong>{todayCount}</strong> aaj
          </div>
          <div style={styles.pill}>
            <strong>{tomorrowCount}</strong> kal
          </div>
          <button style={styles.newMeetingBtn} onClick={() => setShowScheduleModal(true)}>
            + Nayi Meeting
          </button>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onScheduled={load}
        />
      )}

      {/* 7 din ki week strip */}
      <div style={styles.weekStrip}>
        {weekDays.map((d) => {
          const key = d.getTime();
          const count = (meetingsByDayKey[key] || []).length;
          const active = sameDay(d, selectedDay);
          return (
            <button
              key={key}
              style={{ ...styles.dayChip, ...(active ? styles.dayChipActive : {}) }}
              onClick={() => setSelectedDay(startOfDay(d))}
            >
              <div style={styles.dayChipWeekday}>
                {d.toLocaleDateString("en-IN", { weekday: "short" })}
              </div>
              <div style={styles.dayChipNum}>{d.getDate()}</div>
              {count > 0 && (
                <div style={{ ...styles.dayChipDot, ...(active ? { background: "#fff" } : {}) }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={styles.selectedDayHeader}>
        {dayLabel(selectedDay)}
        <span style={styles.selectedDayMeetingCount}>
          {selectedMeetings.length === 0
            ? "koi meeting nahi"
            : `${selectedMeetings.length} meeting${selectedMeetings.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {loading && <LoadingScreen message="Calendar load ho raha hai..." />}

      {/* 24-hour timeline - poora din hour-by-hour dikhta hai, khali ghante bhi */}
      {!loading && (
        <div style={styles.timeline} ref={timelineRef}>
          {HOURS.map((h) => {
            const hourMeetings = selectedMeetings.filter(
              (m) => new Date(m.scheduledAt).getHours() === h
            );
            const isCurrentHour = isSelectedToday && h === currentHour;
            return (
              <div key={h} style={styles.hourRow}>
                <div style={styles.hourLabel}>{formatHour(h)}</div>
                <div style={styles.hourContent}>
                  {isCurrentHour && (
                    <div
                      style={{
                        ...styles.nowLine,
                        top: `${currentMinuteFraction * 100}%`,
                      }}
                    >
                      <span style={styles.nowDot} />
                    </div>
                  )}
                  {hourMeetings.length === 0 && <div style={styles.hourEmpty} />}
                  {hourMeetings.map((m) => {
                    const other = m.conversation?.participants?.find((p) => p._id !== user.id);
                    const color = avatarColor(other?.displayName || "");
                    return (
                      <div key={m._id} style={styles.meetingCard}>
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
                            {formatTime(m.scheduledAt)} ({m.duration || 30}m) · {other?.displayName} ·{" "}
                            {m.callType === "video" ? "🎥 Video" : "🎙️ Audio"}
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
              </div>
            );
          })}
        </div>
      )}

      {!loading && meetings.length === 0 && (
        <div style={styles.emptyState}>
          🗓️ Koi meeting schedule nahi hai. Kisi chat mein 📅 icon se meeting schedule kar sakte ho.
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
  },
  header: {
    padding: "22px 24px 14px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
  },
  liveClock: { color: "var(--text-muted)", fontSize: 13, marginTop: 6 },
  liveTime: { color: "var(--accent)", fontWeight: 700 },
  summaryPills: { display: "flex", gap: 8 },
  pill: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 12.5,
    color: "var(--text-muted)",
  },
  newMeetingBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  weekStrip: {
    display: "flex",
    gap: 8,
    padding: "0 24px 14px",
    overflowX: "auto",
  },
  dayChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 52,
    padding: "8px 6px 10px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    flexShrink: 0,
  },
  dayChipActive: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
    color: "#fff",
  },
  dayChipWeekday: { fontSize: 10.5, fontWeight: 700, opacity: 0.75, textTransform: "uppercase" },
  dayChipNum: { fontSize: 16, fontWeight: 700 },
  dayChipDot: { width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" },
  selectedDayHeader: {
    padding: "0 24px 10px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14.5,
    fontWeight: 700,
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
    paddingBottom: 12,
  },
  selectedDayMeetingCount: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-muted)",
  },
  emptyText: { color: "var(--text-muted)", fontSize: 14, padding: "20px 24px" },
  emptyState: {
    color: "var(--text-muted)",
    fontSize: 13,
    textAlign: "center",
    padding: "14px 20px 20px",
    lineHeight: 1.6,
  },
  timeline: {
    flex: 1,
    overflowY: "auto",
    padding: "6px 24px 24px",
  },
  hourRow: {
    display: "flex",
    gap: 12,
    minHeight: 56,
    borderTop: "1px solid var(--border-soft)",
  },
  hourLabel: {
    width: 54,
    flexShrink: 0,
    fontSize: 11,
    color: "var(--text-faint)",
    paddingTop: 6,
  },
  hourContent: {
    flex: 1,
    position: "relative",
    padding: "6px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  hourEmpty: { height: 30 },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderTop: "2px solid var(--danger)",
    zIndex: 2,
  },
  nowDot: {
    position: "absolute",
    left: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--danger)",
  },
  meetingCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "9px 12px",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    fontSize: 12.5,
    flexShrink: 0,
  },
  meetingTitle: { fontSize: 13.5, fontWeight: 600 },
  meetingMeta: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 },
  joinBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-faint)",
    borderRadius: 8,
    width: 26,
    height: 26,
    fontSize: 12,
    flexShrink: 0,
  },
};
