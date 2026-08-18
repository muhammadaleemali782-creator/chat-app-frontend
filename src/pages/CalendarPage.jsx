import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import LoadingScreen from "../components/LoadingScreen.jsx";
import ScheduleMeetingModal from "../components/ScheduleMeetingModal.jsx";

const DAY_MS = 24 * 60 * 60 * 1000;
// Show 180 days in the past and 365 days in the future
const PAST_DAYS = 60;
const FUTURE_DAYS = 365;

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Build the full day array: PAST_DAYS before today + today + FUTURE_DAYS ahead
const buildDayList = () => {
  const today = startOfDay(new Date());
  return Array.from({ length: PAST_DAYS + 1 + FUTURE_DAYS }, (_, i) => {
    const d = new Date(today.getTime() + (i - PAST_DAYS) * DAY_MS);
    return startOfDay(d);
  });
};

const DAY_LIST = buildDayList();

export default function CalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();
  const { startCall } = useCall();
  const timelineRef = useRef(null);
  const stripRef = useRef(null);
  const scrolledOnceRef = useRef(false);
  const todayChipRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/meetings");
      setMeetings(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Scroll strip to today on mount
  useEffect(() => {
    if (todayChipRef.current && stripRef.current) {
      const chip = todayChipRef.current;
      const strip = stripRef.current;
      const chipLeft = chip.offsetLeft;
      const stripWidth = strip.clientWidth;
      const chipWidth = chip.offsetWidth;
      strip.scrollLeft = chipLeft - stripWidth / 2 + chipWidth / 2;
    }
  }, []);

  const handleCancel = async (meeting) => {
    const isOrganizer = (meeting.createdBy?._id || meeting.createdBy) === user.id;
    if (isOrganizer) {
      if (!window.confirm("Yeh meeting sabke liye cancel karni hai?")) return;
      const reason = window.prompt("Cancel karne ki wajah? (khali bhi chhod sakte ho)", "");
      if (reason === null) return;
      try { await api.delete(`/meetings/${meeting._id}`, { data: { reason } }); load(); }
      catch (err) { alert(err.response?.data?.message || "Cancel nahi hua"); }
    } else {
      const reason = window.prompt("Kyun nahi aa sakte? (khali bhi chhod sakte ho)", "");
      if (reason === null) return;
      try { await api.put(`/meetings/${meeting._id}/decline`, { reason }); load(); }
      catch (err) { alert(err.response?.data?.message || "Save nahi hua"); }
    }
  };

  const handleDismiss = async (meetingId) => {
    try { await api.put(`/meetings/${meetingId}/dismiss`); load(); }
    catch { /* ignore */ }
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
      } catch { alert("Call shuru nahi ho payi"); }
    })();
  };

  const meetingsByDayKey = useMemo(() => {
    const map = {};
    meetings.forEach((m) => {
      const key = startOfDay(new Date(m.scheduledAt)).getTime();
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    );
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

  // Auto-scroll timeline to current hour
  useEffect(() => {
    if (isSelectedToday && timelineRef.current && !scrolledOnceRef.current) {
      const rowH = 52;
      timelineRef.current.scrollTop = Math.max(0, currentHour * rowH - 80);
      scrolledOnceRef.current = true;
    }
  }, [isSelectedToday, currentHour]);

  const handleDayClick = (d) => {
    setSelectedDay(startOfDay(d));
    scrolledOnceRef.current = false;
  };

  // ─── Month label shown in strip when month changes ───────────────────────────
  const monthLabel = (d) =>
    d.toLocaleDateString("en-IN", { month: "short" });

  return (
    <div style={S.wrap}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <span style={{ fontSize: 22 }}>📅</span>
          <div>
            <h1 style={S.title}>Calendar</h1>
            <div style={S.liveClock}>
              {now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              {" • "}
              <span style={S.liveTime}>
                {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
        <button style={S.newBtn} onClick={() => setShowScheduleModal(true)}>
          <span>+</span> Nayi Meeting
        </button>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <div style={S.statsBar}>
        <div style={S.statChip}>
          <span style={S.statNum}>{todayCount}</span>
          <span style={S.statLbl}>aaj</span>
        </div>
        <div style={S.statChip}>
          <span style={S.statNum}>{tomorrowCount}</span>
          <span style={S.statLbl}>kal</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ ...S.statChip, background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
            <span style={{ ...S.statNum, color: "var(--accent)" }}>{selectedMeetings.length}</span>
            <span style={{ ...S.statLbl, color: "var(--accent)" }}>is din</span>
          </div>
        </div>
      </div>

      {/* ── INFINITE DAY STRIP ─────────────────────────────────── */}
      <div style={S.stripOuter}>
        <div style={S.strip} ref={stripRef}>
          {DAY_LIST.map((d, idx) => {
            const key = d.getTime();
            const active = selectedDay.getTime() === key;
            const isToday = sameDay(d, now);
            const count = (meetingsByDayKey[key] || []).length;
            const prevDay = idx > 0 ? DAY_LIST[idx - 1] : null;
            const showMonthLabel = !prevDay || prevDay.getMonth() !== d.getMonth();

            return (
              <div key={key} style={S.chipCol} ref={isToday ? todayChipRef : null}>
                {showMonthLabel && (
                  <div style={S.monthPill}>{monthLabel(d)}</div>
                )}
                <button
                  type="button"
                  style={{
                    ...S.dayChip,
                    ...(active ? S.dayChipActive : {}),
                    ...(isToday && !active ? S.dayChipToday : {}),
                  }}
                  onClick={() => handleDayClick(d)}
                >
                  <span style={{ ...S.chipWday, ...(active ? { color: "#fff" } : {}) }}>
                    {d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3).toUpperCase()}
                  </span>
                  <span style={{ ...S.chipNum, ...(active ? { color: "#fff" } : {}) }}>
                    {d.getDate()}
                  </span>
                  {/* Meeting dot indicator */}
                  <span style={{
                    ...S.chipDot,
                    background: active ? "#fff" : count > 0 ? "var(--accent)" : "transparent",
                    border: count === 0 ? "1.5px solid transparent" : active ? "none" : "none",
                  }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SELECTED DAY LABEL ─────────────────────────────────── */}
      <div style={S.dayBar}>
        <span style={S.dayBarLabel}>{dayLabel(selectedDay)}</span>
        <span style={S.dayBarCount}>
          {selectedMeetings.length === 0
            ? "Koi meeting nahi"
            : `${selectedMeetings.length} meeting${selectedMeetings.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {loading && <LoadingScreen message="Calendar load ho raha hai..." />}

      {/* ── 24-HOUR TIMELINE ──────────────────────────────────── */}
      {!loading && (
        <div style={S.timeline} ref={timelineRef}>
          {/* No meetings empty state shown inside timeline */}
          {selectedMeetings.length === 0 && (
            <div style={S.emptyCard}>
              <div style={S.emptyIcon}>📅</div>
              <div style={S.emptyTitle}>Koi meeting schedule nahi hai</div>
              <div style={S.emptySub}>
                Kisi bhi chat mein 📅 icon se ya upar ke button se meeting schedule karo.
              </div>
              <button style={S.newBtn} onClick={() => setShowScheduleModal(true)}>
                + Abhi Schedule Karo
              </button>
            </div>
          )}

          {HOURS.map((h) => {
            const hourMeetings = selectedMeetings.filter(
              (m) => new Date(m.scheduledAt).getHours() === h
            );
            const isCurrentHour = isSelectedToday && h === currentHour;
            const hasContent = hourMeetings.length > 0 || isCurrentHour;

            // Skip empty hours when there are meetings (show only hours with meetings + ±1 buffer)
            const hasMeetings = selectedMeetings.length > 0;
            const nearbyHour = hasMeetings && selectedMeetings.some(
              (m) => Math.abs(new Date(m.scheduledAt).getHours() - h) <= 1
            );
            if (hasMeetings && !hasContent && !nearbyHour) {
              return null;
            }

            return (
              <div key={h} style={S.hourRow}>
                <div style={{ ...S.hourLabel, ...(isCurrentHour ? S.hourLabelNow : {}) }}>
                  {formatHour(h)}
                </div>
                <div style={S.hourContent}>
                  {isCurrentHour && (
                    <div style={{ ...S.nowLine, top: `${currentMinuteFraction * 100}%` }}>
                      <span style={S.nowDot} />
                    </div>
                  )}
                  {hourMeetings.map((m) => {
                    const isOrganizer = (m.createdBy?._id || m.createdBy) === user.id;
                    const myInvite = m.invitees?.find(
                      (inv) => (inv.user?._id || inv.user) === user.id
                    );
                    const iDeclined = myInvite?.status === "declined";
                    const otherNames = isOrganizer
                      ? m.invitees.map((inv) => inv.user?.displayName).filter(Boolean).join(", ")
                      : m.createdBy?.displayName;
                    const label = isOrganizer ? m.createdBy?.displayName : otherNames;
                    const color = avatarColor(label || "");

                    return (
                      <div
                        key={m._id}
                        style={{ ...S.meetCard, ...(iDeclined ? { opacity: 0.55 } : {}) }}
                      >
                        <div style={{ ...S.meetAvatar, background: color.bg, color: color.fg }}>
                          {(label || "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={S.meetBody}>
                          <div style={S.meetTitle}>{m.title}</div>
                          <div style={S.meetMeta}>
                            {formatTime(m.scheduledAt)} · {m.duration || 30}m ·{" "}
                            {m.callType === "video" ? "🎥" : "🎙️"}{" "}
                            {isOrganizer ? otherNames : `by ${otherNames}`}
                          </div>
                          {iDeclined && (
                            <div style={S.declinedTag}>
                              Decline kar diya{myInvite.declineReason ? ` — "${myInvite.declineReason}"` : ""}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                          {iDeclined ? (
                            <button style={S.actBtn} onClick={() => handleDismiss(m._id)}>
                              Hide
                            </button>
                          ) : (
                            <>
                              <button
                                style={{
                                  ...S.joinBtn,
                                  ...(m.invitees.length !== 1 ? { opacity: 0.4, cursor: "not-allowed" } : {}),
                                }}
                                disabled={m.invitees.length !== 1}
                                onClick={() => handleJoin(m)}
                              >
                                Join 🚀
                              </button>
                              <button style={S.actBtn} onClick={() => handleCancel(m)}>
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {hourMeetings.length === 0 && <div style={{ height: 40 }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => { setShowScheduleModal(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  wrap: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    overflowX: "hidden",
    overflowY: "hidden",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px 10px",
    borderBottom: "1px solid var(--border-soft)",
    gap: 8,
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  liveClock: { color: "var(--text-muted)", fontSize: 11, marginTop: 1 },
  liveTime: { color: "var(--accent)", fontWeight: 700 },
  newBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    boxShadow: "0 2px 8px var(--accent-glow)",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  // Stats bar
  statsBar: {
    display: "flex",
    gap: 8,
    padding: "8px 18px",
    alignItems: "center",
    flexShrink: 0,
  },
  statChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "4px 10px",
  },
  statNum: { fontWeight: 800, fontSize: 13, color: "var(--text)" },
  statLbl: { fontSize: 11, color: "var(--text-muted)" },

  // Infinite day strip
  stripOuter: {
    borderBottom: "1px solid var(--border-soft)",
    flexShrink: 0,
    position: "relative",
  },
  strip: {
    display: "flex",
    overflowX: "auto",
    scrollbarWidth: "none",
    padding: "6px 10px 8px",
    gap: 4,
    alignItems: "flex-end",
    WebkitOverflowScrolling: "touch",
  },
  chipCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  monthPill: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-faint)",
    background: "var(--surface-2)",
    borderRadius: 4,
    padding: "1px 4px",
    marginBottom: 2,
  },
  dayChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    width: 44,
    padding: "7px 4px",
    borderRadius: 10,
    border: "1.5px solid transparent",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.13s ease",
  },
  dayChipActive: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
    boxShadow: "0 4px 12px var(--accent-glow)",
  },
  dayChipToday: {
    borderColor: "var(--accent)",
    background: "var(--accent-soft)",
  },
  chipWday: {
    fontSize: 9,
    fontWeight: 700,
    color: "var(--text-muted)",
    letterSpacing: "0.04em",
  },
  chipNum: {
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    color: "var(--text)",
    lineHeight: 1,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    marginTop: 1,
    transition: "background 0.13s ease",
  },

  // Day label bar
  dayBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 18px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border-soft)",
    flexShrink: 0,
  },
  dayBarLabel: { fontWeight: 700, fontSize: 13, color: "var(--text)" },
  dayBarCount: { fontSize: 11.5, color: "var(--text-muted)" },

  // Timeline
  timeline: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "6px 14px 24px",
  },
  hourRow: {
    display: "flex",
    gap: 10,
    minHeight: 48,
    borderBottom: "1px dashed var(--border-soft)",
  },
  hourLabel: {
    width: 46,
    fontSize: 10.5,
    color: "var(--text-faint)",
    paddingTop: 6,
    fontFamily: "monospace",
    flexShrink: 0,
    textAlign: "right",
  },
  hourLabelNow: { color: "#ef4444", fontWeight: 700 },
  hourContent: {
    flex: 1,
    position: "relative",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    paddingTop: 4,
  },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1.5,
    background: "#ef4444",
    zIndex: 5,
  },
  nowDot: {
    position: "absolute",
    left: -4,
    top: -4,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#ef4444",
    display: "block",
  },

  // Meeting card in timeline
  meetCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "9px 11px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    boxShadow: "var(--shadow-soft)",
  },
  meetAvatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
  },
  meetBody: { flex: 1, minWidth: 0 },
  meetTitle: { fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 },
  meetMeta: {
    fontSize: 11,
    color: "var(--text-muted)",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  declinedTag: { fontSize: 10.5, color: "var(--danger)", marginTop: 2 },
  joinBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "5px 10px",
    fontSize: 11.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  actBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    padding: "5px 8px",
    fontSize: 11,
    color: "var(--text-muted)",
    cursor: "pointer",
  },

  // Empty state
  emptyCard: {
    margin: "32px 16px",
    padding: "28px 20px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    boxShadow: "var(--shadow-soft)",
  },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 },
  emptySub: {
    fontSize: 12.5,
    color: "var(--text-muted)",
    maxWidth: 300,
    lineHeight: 1.5,
    margin: 0,
  },
};
