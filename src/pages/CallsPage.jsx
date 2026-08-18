import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function CallsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { startCall } = useCall();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/calls");
      setLogs(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const sameDay =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
    if (sameDay) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatDuration = (secs) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleCallBack = (log, otherUser) => {
    startCall(otherUser, log.conversation, log.callType);
  };

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>📞</span>
          <h1 style={styles.title}>Calls</h1>
        </div>
        <p style={styles.subtitle}>Recent audio & HD video calls ki history</p>
      </div>

      <div style={styles.content}>
        {loading && <LoadingScreen message="Call history load ho rahi hai..." />}

        {!loading && logs.length === 0 && (
          <div style={styles.emptyStateCard}>
            <div style={styles.emptyIconBadge}>📞</div>
            <h2 style={styles.emptyTitle}>Abhi tak koi call nahi hui</h2>
            <p style={styles.emptySub}>
              Aap kisi bhi user ki chat khol kar top header me diye 📹 video ya 🎙️ audio call icon se instant call shuru kar sakte hain.
            </p>
          </div>
        )}

        {logs.map((log) => {
          const isOutgoing = log.caller?._id === user.id;
          const other = isOutgoing ? log.callee : log.caller;
          const color = avatarColor(other?.displayName || "");
          const statusIcon =
            log.status === "missed" || log.status === "rejected"
              ? "↙️"
              : isOutgoing
              ? "↗️"
              : "↙️";
          const statusColor =
            log.status === "missed" || log.status === "rejected" ? "var(--danger)" : "var(--text-muted)";

          return (
            <div key={log._id} style={styles.callItem}>
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
                <div style={styles.callName}>{other?.displayName || "Unknown"}</div>
                <div style={{ ...styles.callMeta, color: statusColor }}>
                  {statusIcon} {log.callType === "video" ? "HD Video" : "Audio"}
                  {log.status === "missed" && " · Missed"}
                  {log.status === "rejected" && " · Declined"}
                  {log.status === "completed" && log.durationSeconds > 0 && ` · ${formatDuration(log.durationSeconds)}`}
                </div>
              </div>
              <div style={styles.timeCol}>{formatTime(log.createdAt)}</div>
              <button
                type="button"
                style={styles.callBtn}
                onClick={() => handleCallBack(log, other)}
                title="Wapas call karo"
              >
                {log.callType === "video" ? "📹" : "🎙️"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: { height: "100%", overflowY: "auto", background: "var(--bg)" },
  header: {
    padding: "20px 24px 14px",
    maxWidth: 680,
    margin: "0 auto",
    borderBottom: "1px solid var(--border-soft)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
    color: "var(--text)",
  },
  subtitle: { color: "var(--text-muted)", fontSize: 13, marginTop: 4 },
  content: { padding: "16px 20px 40px", maxWidth: 680, margin: "0 auto" },
  emptyStateCard: {
    margin: "40px auto",
    padding: "36px 24px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "var(--shadow-soft)",
    maxWidth: 420,
  },
  emptyIconBadge: {
    fontSize: 34,
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
    lineHeight: 1.5,
    margin: 0,
  },
  callItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    marginBottom: 8,
    boxShadow: "var(--shadow-soft)",
  },
  avatar: {
    width: 42,
    height: 42,
    minWidth: 42,
    minHeight: 42,
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    fontSize: 15,
    flexShrink: 0,
  },
  callName: { fontSize: 14.5, fontWeight: 700, color: "var(--text)" },
  callMeta: { fontSize: 12, marginTop: 2 },
  timeCol: { fontSize: 11.5, color: "var(--text-faint)", marginLeft: "auto", marginRight: 6 },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "var(--accent-soft)",
    border: "1px solid var(--border)",
    fontSize: 16,
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
};
