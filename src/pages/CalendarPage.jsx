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

  // Live clock refresh every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleCancel = async (meeting) => {
    const isOrganizer = (meeting.createdBy?._id || meeting.createdBy) === user.id;
    if (isOrganizer) {
      if (!window.confirm("Yeh meeting sabke liye cancel karni hai?")) return;
      const reason = window.prompt("Cancel karne ki wajah kya hai? (khali bhi chhod sakte ho)", "");
      if (reason === null) return;
      try {
        await api.delete(`/meetings/${meeting._id}`, { data: { reason } });
        load();
      } catch (err) {
        alert(err.response?.data?.message || "Meeting cancel nahi ho payi, dobara try karo");
      }
    } else {
      const reason = window.prompt("Kyun nahi aa sakte? (khali bhi chhod sakte ho)", "");
      if (reason === null) return;
      try {
        await api.put(`/meetings/${meeting._id}/decline`, { reason });
        load();
      } catch (err) {
        alert(err.response?.data?.message || "Save nahi hua, dobara try karo");
      }
    }
  };

  const handleDismiss = async (meetingId) => {
    try {
      await api.put(`/meetings/${meetingId}/dismiss`);
      load();
    } catch (err) {
      // ignore
    }
  };

  const handleJoin = (meeting) => {
    if (meeting.invitees.length !== 1) return;
    const isOrganizer = (meeting.createdBy?._id || meeting.createdBy) === user.id;
    const other = isOrganizer ? meeting.invitees[0].user : meeting.createdBy;
    if (!other?._id) return;
    (async () => {
      try {
        const convId =
          meeting.conversation ||
          (await api.post("/conversations/start", { otherUserId: other._id })).data._id;
        startCall(other, convId, meeting.callType);
      } catch (err) {
        alert("Call shuru nahi ho payi");
      }
    })();
  };

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

  const todayCount = (meetingsByDayKey[startOfDay(now).getTime()] || []).length;
  const tomorrowCount = (meetingsByDayKey[startOfDay(new Date(now.getTime() + DAY_MS)).getTime()] || []).length;

  const dayLabel = (d) => {
    if (sameDay(d, now)) return "Aaj";
    if (sameDay(d, new Date(startOfDay(now).getTime() + DAY_MS))) return "Kal";
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const currentHour = now.getHours();
  const currentMinuteFraction = now.getMinutes() / 60;

  useEffect(() => {
    if (isSelectedToday && timelineRef.current && !scrolledOnceRef.current) {
      const rowHeight = 56;
      timelineRef.current.scrollTop = Math.max(0, currentHour * rowHeight - 100);
      scrolledOnceRef.current = true;
    }
  }, [isSelectedToday, currentHour]);

  return (
    <div style={styles.wrap} className="calendar-page-container">
      {/* 1. Header with Clock & New Meeting CTA */}
      <div style={styles.header}>
        <div style={styles.headerTitleBlock}>
          <div style={styles.titleRow}>
            <span style={{ fontSize: 24 }}>📅</span>
            <h1 style={styles.title}>Calendar</h1>
          </div>
          <div style={styles.liveClock}>
            {now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} •{" "}
            <span style={styles.liveTime}>{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <button
          type="button"
          style={styles.newMeetingBtn}
          onClick={() => setShowScheduleModal(true)}
        >
          <span>+</span>
          <span>Nayi Meeting</span>
        </button>
      </div>

      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => {
            setShowScheduleModal(false);
            load();
          }}
        />
      )}

      {/* 2. Today / Tomorrow Counter Badges */}
      <div style={styles.summaryRow}>
        <div style={styles.pill}>
          <strong>{todayCount}</strong> aaj
        </div>
        <div style={styles.pill}>
          <strong>{tomorrowCount}</strong> kal
        </div>
        <div style={{ ...styles.pill, marginLeft: "auto", color: "var(--accent)" }}>
          {selectedMeetings.length} on this day
        </div>
      </div>

      {/* 3. 7-Day Week Strip (No Scrollbar, Perfectly Padded) */}
      <div style={styles.weekStrip}>
        {weekDays.map((d) => {
          const key = d.getTime();
          const active = selectedDay.getTime() === key;
          const count = (meetingsByDayKey[key] || []).length;
          return (
            <button
              key={key}
              type="button"
              style={{ ...styles.dayChip, ...(active ? styles.dayChipActive : {}) }}
              onClick={() => setSelectedDay(startOfDay(d))}
            >
              <div style={{ ...styles.dayChipWeekday, ...(active ? { color: "#ffffff" } : {}) }}>
                {d.toLocaleDateString("en-IN", { weekday: "short" })}
              </div>
              <div style={{ ...styles.dayChipNum, ...(active ? { color: "#ffffff" } : {}) }}>{d.getDate()}</div>
              {count > 0 && (
                <div style={{ ...styles.dayChipDot, ...(active ? { background: "#ffffff" } : {}) }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Selected Day Status Bar */}
      <div style={styles.selectedDayHeader}>
        <span style={{ fontWeight: 700, color: "var(--text)" }}>{dayLabel(selectedDay)}</span>
        <span style={styles.selectedDayMeetingCount}>
          {selectedMeetings.length === 0
            ? "Koi meeting nahi"
            : `${selectedMeetings.length} meeting${selectedMeetings.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {loading && <LoadingScreen message="Calendar load ho raha hai..." />}

      {/* 5. 24-Hour Timeline */}
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
                    const isOrganizer = (m.createdBy?._id || m.createdBy) === user.id;
                    const myInvite = m.invitees?.find((inv) => (inv.user?._id || inv.user) === user.id);
                    const iDeclined = myInvite?.status === "declined";
                    const otherNames = isOrganizer
                      ? m.invitees.map((inv) => inv.user?.displayName).filter(Boolean).join(", ")
                      : m.createdBy?.displayName;
                    const label = isOrganizer ? m.createdBy?.displayName : otherNames;
                    const color = avatarColor(label || "");
                    return (
                      <div
                        key={m._id}
                        style={{ ...styles.meetingCard, ...(iDeclined ? styles.meetingCardDeclined : {}) }}
                      >
                        <div
                          style={{
                            ...styles.avatar,
                            background: color.bg,
                            color: color.fg,
                          }}
                        >
                          {(label || "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.meetingTitle}>{m.title}</div>
                          <div style={styles.meetingMeta}>
                            {formatTime(m.scheduledAt)} ({m.duration || 30}m) ·{" "}
                            {isOrganizer ? `Sabko invite kiya: ${otherNames}` : otherNames} ·{" "}
                            {m.callType === "video" ? "🎥 Video" : "🎙️ Audio"}
                          </div>
                          {iDeclined && (
                            <div style={styles.declinedTag}>
                              Aapne decline kar diya {myInvite.declineReason ? `- "${myInvite.declineReason}"` : ""}
                            </div>
                          )}
                        </div>
                        {iDeclined ? (
                          <button
                            type="button"
                            style={styles.cancelBtn}
                            onClick={() => handleDismiss(m._id)}
                            title="Calendar se hataao"
                          >
                            Hide
                          </button>
                        ) : (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              type="button"
                              className="primary-btn"
                              style={{
                                ...styles.joinBtn,
                                ...(m.invitees.length !== 1 ? styles.joinBtnDisabled : {}),
                              }}
                              onClick={() => handleJoin(m)}
                              disabled={m.invitees.length !== 1}
                              title={
                                m.invitees.length !== 1
                                  ? "Group calling abhi available nahi hai"
                                  : "Abhi call karo"
                              }
                            >
                              Join 🚀
                            </button>
                            <button
                              type="button"
                              style={styles.cancelBtn}
                              onClick={() => handleCancel(m)}
                              title={isOrganizer ? "Sabke liye cancel karo" : "Main nahi aa sakta"}
                            >
                              ✕
                            </button>
                          </div>
                        )}
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
        <div style={styles.emptyStateCard}>
          <div style={styles.emptyIconBadge}>📅</div>
          <h2 style={styles.emptyTitle}>Koi meeting schedule nahi hai</h2>
          <p style={styles.emptySub}>
            Aap kisi bhi chat ke andar 📅 meeting icon par click karke ya upar diye button se nayi meeting schedule kar sakte hain.
          </p>
          <button
            type="button"
            style={styles.newMeetingBtn}
            onClick={() => setShowScheduleModal(true)}
          >
            + Abhi Meeting Schedule Karo
          </button>
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
    overflowY: "auto",
    overflowX: "hidden",
  },
  header: {
    padding: "18px 20px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottom: "1px solid var(--border-soft)",
  },
  headerTitleBlock: {
    display: "flex",
    flexDirection: "column",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 800,
    margin: 0,
    color: "var(--text)",
  },
  liveClock: {
    color: "var(--text-muted)",
    fontSize: 12,
    marginTop: 2,
  },
  liveTime: {
    color: "var(--accent)",
    fontWeight: 700,
  },
  newMeetingBtn: {
    background: "var(--accent)",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 2px 8px var(--accent-glow)",
    flexShrink: 0,
  },
  summaryRow: {
    display: "flex",
    gap: 8,
    padding: "10px 20px",
    alignItems: "center",
  },
  pill: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "4px 12px",
    fontSize: 12,
    color: "var(--text-muted)",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  weekStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    padding: "4px 12px 12px",
    overflowX: "hidden",
  },
  dayChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    flex: 1,
    minWidth: 40,
    padding: "6px 2px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  dayChipActive: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
    boxShadow: "0 4px 12px var(--accent-glow)",
  },
  dayChipWeekday: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  dayChipNum: {
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    color: "var(--text)",
  },
  dayChipDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  selectedDayHeader: {
    padding: "8px 20px",
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--surface-2)",
    borderTop: "1px solid var(--border-soft)",
    borderBottom: "1px solid var(--border-soft)",
  },
  selectedDayMeetingCount: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  timeline: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 16px 24px",
  },
  hourRow: {
    display: "flex",
    minHeight: 52,
    borderBottom: "1px dashed var(--border-soft)",
  },
  hourLabel: {
    width: 60,
    fontSize: 11,
    color: "var(--text-faint)",
    paddingTop: 6,
    fontFamily: "monospace",
    flexShrink: 0,
  },
  hourContent: {
    flex: 1,
    position: "relative",
    padding: "4px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    background: "#ef4444",
    zIndex: 10,
  },
  nowDot: {
    position: "absolute",
    left: -5,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#ef4444",
  },
  hourEmpty: {
    height: "100%",
  },
  meetingCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "var(--shadow-soft)",
  },
  meetingCardDeclined: {
    opacity: 0.6,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  meetingTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "var(--text)",
  },
  meetingMeta: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    marginTop: 2,
  },
  declinedTag: {
    fontSize: 11,
    color: "var(--danger)",
    marginTop: 2,
  },
  joinBtn: {
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: 8,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
  joinBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  cancelBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 11.5,
    cursor: "pointer",
  },
  emptyStateCard: {
    margin: "40px 20px",
    padding: "32px 20px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "var(--shadow-soft)",
  },
  emptyIconBadge: {
    fontSize: 36,
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 800,
    margin: "0 0 6px",
    color: "var(--text)",
  },
  emptySub: {
    fontSize: 13,
    color: "var(--text-muted)",
    maxWidth: 320,
    lineHeight: 1.5,
    margin: "0 0 20px",
  },
};
