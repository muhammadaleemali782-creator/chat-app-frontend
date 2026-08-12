import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";

const MAX_YEAR = new Date().getFullYear() + 3; // 3 saal se aage schedule nahi kar sakte (galti se bade number type hone se bachata hai)

export default function MeetingScheduler({ conversationId, otherUserId, onStartCall, onClose }) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [callType, setCallType] = useState("video");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  // Jab bhi date/time change ho, check karo ki us bande ke saath us waqt koi clash to nahi
  useEffect(() => {
    if (!date || !time || !otherUserId) {
      setConflict(null);
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime())) {
      setConflict(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await api.post("/meetings/check-conflict", {
          userIds: [otherUserId],
          scheduledAt: scheduledAt.toISOString(),
          duration,
          excludeMeetingId: editingId,
        });
        setConflict(res.data.conflict ? res.data.meeting : null);
      } catch (err) {
        setConflict(null);
      } finally {
        setCheckingConflict(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [date, time, otherUserId, duration, editingId]);

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
      if (editingId) {
        await api.put(`/meetings/${editingId}`, {
          title: title.trim(),
          scheduledAt: scheduledAt.toISOString(),
          callType,
          duration,
        });
        setEditingId(null);
      } else {
        await api.post("/meetings", {
          conversationId,
          title: title.trim(),
          scheduledAt: scheduledAt.toISOString(),
          callType,
          duration,
        });
      }
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

  const startEdit = (m) => {
    setEditingId(m._id);
    setTitle(m.title);
    const d = new Date(m.scheduledAt);
    setDate(d.toISOString().slice(0, 10));
    setTime(d.toTimeString().slice(0, 5));
    setCallType(m.callType);
    setDuration(m.duration || 30);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setTime("");
    setError("");
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Cancel karne ki wajah kya hai? (khali bhi chhod sakte ho)", "");
    if (reason === null) return; // user ne "Cancel" dabaya prompt box ka
    try {
      await api.delete(`/meetings/${id}`, { data: { reason } });
      await loadMeetings();
    } catch (err) {
      alert(err.response?.data?.message || "Meeting cancel nahi ho payi, dobara try karo");
    }
  };

  const handleDecline = async (id) => {
    const reason = window.prompt("Kyun nahi aa sakte? (khali bhi chhod sakte ho)", "");
    if (reason === null) return;
    try {
      await api.put(`/meetings/${id}/decline`, { reason });
      await loadMeetings();
    } catch (err) {
      alert(err.response?.data?.message || "Save nahi hua, dobara try karo");
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
                  {date && !isNaN(new Date(date).getTime()) && (
                    <div style={styles.dayHint}>
                      {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                        weekday: "long",
                      })}
                    </div>
                  )}
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

              {checkingConflict && (
                <div style={styles.checkingText}>Clash check ho raha hai...</div>
              )}

              {conflict && (
                <div style={styles.conflictWarning}>
                  ⚠️ Is bande ke saath is waqt ke aas-paas pehle se ek meeting hai:{" "}
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

              <label style={styles.label}>Kitni der ki meeting hai</label>
              <div style={styles.row}>
                {[15, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    style={{
                      ...styles.durationBtn,
                      ...(duration === d ? styles.typeBtnActive : {}),
                    }}
                    onClick={() => setDuration(d)}
                  >
                    {d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                ))}
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
                {loading
                  ? editingId
                    ? "Update ho raha hai..."
                    : "Schedule ho raha hai..."
                  : editingId
                  ? "Meeting update karo"
                  : "Meeting schedule karo"}
              </button>
              {editingId && (
                <button type="button" style={styles.cancelEditBtn} onClick={cancelEdit}>
                  Edit cancel karo
                </button>
              )}
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
              {meetings.map((m) => {
                const isOrganizer = (m.createdBy?._id || m.createdBy) === user.id;
                const myInvite = m.invitees?.find((inv) => (inv.user?._id || inv.user) === user.id);
                const iDeclined = myInvite?.status === "declined";
                return (
                  <div
                    key={m._id}
                    style={{ ...styles.meetingItem, ...(iDeclined ? styles.meetingItemDeclined : {}) }}
                  >
                    <div style={styles.meetingIcon}>{m.callType === "video" ? "🎥" : "🎙️"}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={styles.meetingTitle}>{m.title}</div>
                      <div style={styles.meetingTime}>
                        {formatMeetingTime(m.scheduledAt)} · {m.duration || 30} min
                      </div>
                      {iDeclined && <div style={styles.declinedTag}>Aapne decline kar diya hai</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {!iDeclined && (
                        <button
                          className="primary-btn"
                          style={styles.joinBtn}
                          onClick={() => onStartCall(m.callType)}
                          title="Abhi call karo"
                        >
                          Join
                        </button>
                      )}
                      {isOrganizer ? (
                        <>
                          <button style={styles.editBtn} onClick={() => startEdit(m)} title="Edit karo">
                            ✏️
                          </button>
                          <button
                            style={styles.cancelBtn}
                            onClick={() => handleCancel(m._id)}
                            title="Sabke liye cancel karo"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        !iDeclined && (
                          <button
                            style={styles.cancelBtn}
                            onClick={() => handleDecline(m._id)}
                            title="Main nahi aa sakta"
                          >
                            ✕
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
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
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12.5,
    marginTop: 6,
  },
  dayHint: {
    fontSize: 11.5,
    color: "var(--text-faint)",
    marginTop: 4,
  },
  checkingText: {
    fontSize: 11.5,
    color: "var(--text-faint)",
    marginTop: 6,
  },
  conflictWarning: {
    background: "rgba(240,98,95,0.12)",
    border: "1px solid rgba(240,98,95,0.3)",
    color: "var(--danger)",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.5,
    marginTop: 8,
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
  cancelEditBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12,
    marginTop: 6,
    textDecoration: "underline",
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
  meetingItemDeclined: { opacity: 0.55 },
  declinedTag: { fontSize: 10.5, color: "var(--danger)", fontWeight: 600, marginTop: 2 },
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
  editBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    width: 30,
    borderRadius: 8,
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
