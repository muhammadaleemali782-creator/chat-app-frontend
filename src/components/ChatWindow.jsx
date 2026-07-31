import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { usePresence } from "../context/PresenceContext.jsx";
import { getSocket } from "../socket";
import { Avatar } from "./Sidebar.jsx";
import { avatarColor } from "../utils/avatarColor";
import MeetingScheduler from "./MeetingScheduler.jsx";

function formatTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Aaj";
  if (sameDay(d, yesterday)) return "Kal";

  const daysDiff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return d.toLocaleDateString("en-IN", { weekday: "long" });
  }

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function dateKey(dateString) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function ChatWindow({ conversation, messages, onSend, onBack }) {
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const { startCall, callState } = useCall();
  const { isOnline } = usePresence();

  const other = conversation.participants.find((p) => p._id !== user.id);
  const otherColor = avatarColor(other?.displayName || "");

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) setOtherTyping(true);
    };
    const handleStopTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) setOtherTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [conversation._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, otherTyping]);

  const handleChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !other) return;

    socket.emit("typing", { conversationId: conversation._id, receiverId: other._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: conversation._id, receiverId: other._id });
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
    const socket = getSocket();
    if (socket && other) {
      socket.emit("stop_typing", { conversationId: conversation._id, receiverId: other._id });
    }
  };

  return (
    <div style={styles.wrap} className="pane-fade">
      <div style={{ ...styles.header, position: "relative" }}>
        <button
          style={styles.backBtn}
          onClick={onBack}
          className="mobile-only-back"
          aria-label="Wapas jao"
        >
          ←
        </button>
        <Avatar name={other?.displayName} online={other && isOnline(other._id)} color={otherColor} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={styles.headerName}>{other?.displayName || "User"}</div>
          <div style={styles.headerStatus}>
            {otherTyping ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                type kar raha hai
                <span className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            ) : other && isOnline(other._id) ? (
              "Online"
            ) : (
              "Offline"
            )}
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.headerIconBtn}
            title="Audio call"
            disabled={callState !== "idle"}
            onClick={() => other && startCall(other, conversation._id, "audio")}
          >
            🎙️
          </button>
          <button
            style={styles.headerIconBtn}
            title="Video call"
            disabled={callState !== "idle"}
            onClick={() => other && startCall(other, conversation._id, "video")}
          >
            🎥
          </button>
          <button
            style={styles.headerIconBtn}
            title="Meetings"
            onClick={() => setShowMeetings((v) => !v)}
          >
            📅
          </button>
        </div>

        {showMeetings && (
          <MeetingScheduler
            conversationId={conversation._id}
            onStartCall={(type) => {
              setShowMeetings(false);
              if (other) startCall(other, conversation._id, type);
            }}
            onClose={() => setShowMeetings(false)}
          />
        )}
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.emptyChat}>
            <div style={styles.emptyChatIcon}>👋</div>
            {other?.displayName} ke saath abhi tak koi message nahi hai.
            <br />
            "Hi" bhej ke shuru karo!
          </div>
        )}
        {messages.map((m, idx) => {
          const isMine = m.sender === user.id || m.sender?._id === user.id;
          const prevMsg = messages[idx - 1];
          const showDateDivider =
            !prevMsg || dateKey(prevMsg.createdAt) !== dateKey(m.createdAt);

          return (
            <div key={m._id}>
              {showDateDivider && (
                <div style={styles.dateDividerRow}>
                  <span style={styles.dateDividerPill}>
                    {formatDateLabel(m.createdAt)}
                  </span>
                </div>
              )}
              <div
                className="msg-bubble-enter"
                style={{
                  ...styles.bubbleRow,
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    background: isMine ? "var(--accent)" : "var(--surface-2)",
                    color: isMine ? "#fff" : "var(--text)",
                    borderBottomRightRadius: isMine ? 4 : 18,
                    borderBottomLeftRadius: isMine ? 18 : 4,
                  }}
                >
                  <span>{m.text}</span>
                  <span
                    style={{
                      ...styles.bubbleTime,
                      color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-faint)",
                    }}
                  >
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form style={styles.inputBar} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          value={text}
          onChange={handleChange}
          placeholder="Message likho..."
        />
        <button className="send-btn" style={styles.sendBtn} type="submit" disabled={!text.trim()}>
          Bhejo
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 22px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 20,
    display: "none",
    marginRight: 2,
    padding: 4,
  },
  headerName: { fontSize: 15, fontWeight: 600 },
  headerStatus: { fontSize: 12.5, color: "var(--text-muted)" },
  headerActions: { display: "flex", gap: 6, flexShrink: 0 },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    fontSize: 15,
    color: "var(--text)",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background:
      "radial-gradient(circle at 20% 10%, rgba(124,111,240,0.05), transparent 40%)",
  },
  emptyChat: {
    margin: "auto",
    color: "var(--text-muted)",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 1.6,
  },
  emptyChatIcon: { fontSize: 30, marginBottom: 10 },
  dateDividerRow: {
    display: "flex",
    justifyContent: "center",
    margin: "6px 0 10px",
  },
  dateDividerPill: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 14px",
    borderRadius: 20,
  },
  bubbleRow: { display: "flex" },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 18,
    fontSize: 14.5,
    lineHeight: 1.45,
    wordBreak: "break-word",
    boxShadow: "var(--shadow-bubble)",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  bubbleTime: {
    fontSize: 10.5,
    alignSelf: "flex-end",
  },
  inputBar: {
    display: "flex",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
  },
  input: {
    flex: 1,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    padding: "12px 18px",
    color: "var(--text)",
    fontSize: 14.5,
  },
  sendBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "0 24px",
    fontWeight: 600,
    fontSize: 14,
  },
};
