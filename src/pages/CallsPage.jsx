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
      <div style={styles.header}>
        <h1 style={styles.title}>📞 Calls</h1>
        <p style={styles.subtitle}>Recent audio/video calls ki history</p>
      </div>

      <div style={styles.content}>
        {loading && <LoadingScreen message="Call history load ho rahi hai..." />}

        {!loading && logs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
            Abhi tak koi call nahi hui.
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
                  {statusIcon} {log.callType === "video" ? "Video" : "Audio"}
                  {log.status === "missed" && " · Missed"}
                  {log.status === "rejected" && " · Reject ki gayi"}
                  {log.status === "completed" && log.durationSeconds > 0 && ` · ${formatDuration(log.durationSeconds)}`}
                </div>
              </div>
              <div style={styles.timeCol}>{formatTime(log.createdAt)}</div>
              <button
                style={styles.callBtn}
                onClick={() => handleCallBack(log, other)}
                title="Wapas call karo"
              >
                {log.callType === "video" ? "🎥" : "🎙️"}
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
  header: { padding: "28px 32px 10px", maxWidth: 640, margin: "0 auto" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: { color: "var(--text-muted)", fontSize: 13.5, marginTop: 6 },
  content: { padding: "10px 32px 40px", maxWidth: 640, margin: "0 auto" },
  emptyText: { color: "var(--text-muted)", fontSize: 14, padding: "20px 0" },
  emptyState: {
    color: "var(--text-muted)",
    fontSize: 14,
    textAlign: "center",
    padding: "60px 20px",
    lineHeight: 1.6,
  },
  callItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 4px",
    borderBottom: "1px solid var(--border-soft)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    fontSize: 15,
    flexShrink: 0,
  },
  callName: { fontSize: 14.5, fontWeight: 600 },
  callMeta: { fontSize: 12.5, marginTop: 2 },
  timeCol: { fontSize: 12, color: "var(--text-faint)" },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    fontSize: 15,
    color: "var(--text)",
  },
};
