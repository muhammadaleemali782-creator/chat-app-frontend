import { useState, useEffect, useRef } from "react";
import { useBackHandler } from "../utils/backHandlerStack";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { usePresence } from "../context/PresenceContext.jsx";
import { getSocket } from "../socket";
import { Avatar } from "./Sidebar.jsx";
import { avatarColor } from "../utils/avatarColor";
import MeetingScheduler from "./MeetingScheduler.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import { compressImage, blobToBase64 } from "../utils/mediaUtils";

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

function replyPreviewText(m) {
  if (!m) return "";
  if (m.type === "image") return "📷 Photo";
  if (m.type === "audio") return "🎤 Voice message";
  return m.text;
}

// Tick icon - sent (ek grey), delivered (do grey), read (do blue) - WhatsApp jaisa
function StatusTicks({ status, isMine, readAt }) {
  if (!isMine) return null;
  const color =
    status === "read" ? "#5ec4ff" : isMine ? "rgba(255,255,255,0.7)" : "var(--text-faint)";
  const title = readAt
    ? `Padha gaya: ${new Date(readAt).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })}`
    : status === "delivered"
    ? "Deliver ho gaya"
    : "Bhej diya";
  return (
    <span style={{ color, fontSize: 12, marginLeft: 3 }} title={title}>
      {status === "sent" ? "✓" : "✓✓"}
    </span>
  );
}

export default function ChatWindow({ conversation, messages, onSend, onBack, loading }) {
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [sendingMedia, setSendingMedia] = useState(false);

  useBackHandler(
    "meeting-scheduler",
    showMeetings,
    () => {
      setShowMeetings(false);
      return true;
    }
  );
  useBackHandler(
    "reply-preview",
    !!replyingTo,
    () => {
      setReplyingTo(null);
      return true;
    }
  );

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
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

  useEffect(() => {
    setReplyingTo(null);
  }, [conversation._id]);

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
    onSend({ text, replyTo: replyingTo?._id });
    setText("");
    setReplyingTo(null);
    const socket = getSocket();
    if (socket && other) {
      socket.emit("stop_typing", { conversationId: conversation._id, receiverId: other._id });
    }
  };

  const handlePhotoPick = () => fileInputRef.current?.click();

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // taaki wahi photo dobara select karne pe bhi change event fire ho
    if (!file || !file.type.startsWith("image/")) return;
    setSendingMedia(true);
    try {
      const dataUrl = await compressImage(file);
      onSend({ type: "image", mediaData: dataUrl, mediaMimeType: "image/jpeg", replyTo: replyingTo?._id });
      setReplyingTo(null);
    } catch (err) {
      // ignore
    } finally {
      setSendingMedia(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recordTimerRef.current);
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          setSendingMedia(true);
          try {
            const dataUrl = await blobToBase64(blob);
            onSend({
              type: "audio",
              mediaData: dataUrl,
              mediaMimeType: "audio/webm",
              replyTo: replyingTo?._id,
            });
            setReplyingTo(null);
          } finally {
            setSendingMedia(false);
          }
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          // 3 minute safety cap - bahut lambi recording accidentally na ho jaaye
          if (s >= 179) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access nahi mila. Settings mein permission check karo.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
  };

  const recMin = String(Math.floor(recordSeconds / 60)).padStart(2, "0");
  const recSec = String(recordSeconds % 60).padStart(2, "0");

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
            otherUserId={other?._id}
            onStartCall={(type) => {
              setShowMeetings(false);
              if (other) startCall(other, conversation._id, type);
            }}
            onClose={() => setShowMeetings(false)}
          />
        )}
      </div>

      <div style={styles.messages}>
        {loading && <LoadingScreen small message="" />}
        {!loading && messages.length === 0 && (
          <div style={styles.emptyChat}>
            <div style={styles.emptyChatIcon}>👋</div>
            {other?.displayName} ke saath abhi tak koi message nahi hai.
            <br />
            "Hi" bhej ke shuru karo!
          </div>
        )}
        {!loading &&
          messages.map((m, idx) => {
            const isMine = m.sender === user.id || m.sender?._id === user.id;
            const prevMsg = messages[idx - 1];
            const showDateDivider =
              !prevMsg || dateKey(prevMsg.createdAt) !== dateKey(m.createdAt);

            return (
              <div key={m._id}>
                {showDateDivider && (
                  <div style={styles.dateDividerRow}>
                    <span style={styles.dateDividerPill}>{formatDateLabel(m.createdAt)}</span>
                  </div>
                )}
                <div
                  className="msg-bubble-enter"
                  style={{
                    ...styles.bubbleRow,
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  {!isMine && (
                    <button
                      style={styles.replyIconBtn}
                      title="Reply karo"
                      onClick={() => setReplyingTo(m)}
                    >
                      ↩
                    </button>
                  )}
                  <div
                    style={{
                      ...styles.bubble,
                      background: isMine ? "var(--accent)" : "var(--surface-2)",
                      color: isMine ? "#fff" : "var(--text)",
                      borderBottomRightRadius: isMine ? 4 : 18,
                      borderBottomLeftRadius: isMine ? 18 : 4,
                    }}
                  >
                    {m.replyTo && (
                      <div
                        style={{
                          ...styles.quotedBox,
                          borderLeftColor: isMine ? "rgba(255,255,255,0.5)" : "var(--accent)",
                          background: isMine ? "rgba(255,255,255,0.12)" : "var(--surface)",
                        }}
                      >
                        {replyPreviewText(m.replyTo)}
                      </div>
                    )}

                    {m.type === "image" && m.mediaData && (
                      <img src={m.mediaData} alt="Photo" style={styles.msgImage} />
                    )}
                    {m.type === "audio" && m.mediaData && (
                      <audio controls src={m.mediaData} style={styles.msgAudio} />
                    )}
                    {m.type !== "image" && m.type !== "audio" && <span>{m.text}</span>}
                    {(m.type === "image" || m.type === "audio") && m.text && (
                      <span>{m.text}</span>
                    )}

                    <span
                      style={{
                        ...styles.bubbleTime,
                        color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-faint)",
                      }}
                    >
                      {formatTime(m.createdAt)}
                      <StatusTicks status={m.status} isMine={isMine} readAt={m.readAt} />
                    </span>
                  </div>
                  {isMine && (
                    <button
                      style={styles.replyIconBtn}
                      title="Reply karo"
                      onClick={() => setReplyingTo(m)}
                    >
                      ↩
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {replyingTo && (
        <div style={styles.replyBar}>
          <div style={styles.replyBarLine} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.replyBarLabel}>
              {replyingTo.sender === user.id || replyingTo.sender?._id === user.id
                ? "Apne message ka reply"
                : `${other?.displayName} ke message ka reply`}
            </div>
            <div style={styles.replyBarText}>{replyPreviewText(replyingTo)}</div>
          </div>
          <button style={styles.replyBarClose} onClick={() => setReplyingTo(null)}>
            ✕
          </button>
        </div>
      )}

      {sendingMedia && (
        <div style={styles.mediaSendingBar}>
          <LoadingScreen small message="" /> Bheja ja raha hai...
        </div>
      )}

      {isRecording ? (
        <div style={styles.recordingBar}>
          <button style={styles.recordCancelBtn} onClick={cancelRecording} title="Cancel karo">
            🗑
          </button>
          <div style={styles.recordingDot} />
          <div style={styles.recordingTime}>
            {recMin}:{recSec}
          </div>
          <div style={styles.recordingHint}>Voice message record ho raha hai...</div>
          <button style={styles.recordSendBtn} onClick={stopRecording} title="Bhejo">
            ➤
          </button>
        </div>
      ) : (
        <form style={styles.inputBar} onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoSelected}
          />
          <button
            type="button"
            style={styles.mediaBtn}
            title="Photo bhejo"
            onClick={handlePhotoPick}
          >
            📷
          </button>
          <button
            type="button"
            style={styles.mediaBtn}
            title="Voice message record karo"
            onClick={startRecording}
          >
            🎤
          </button>
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
      )}
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
  bubbleRow: { display: "flex", alignItems: "flex-end", gap: 4 },
  replyIconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 13,
    padding: 4,
    opacity: 0.55,
    flexShrink: 0,
  },
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
    gap: 5,
  },
  quotedBox: {
    borderLeft: "3px solid",
    padding: "5px 8px",
    borderRadius: 6,
    fontSize: 12.5,
    opacity: 0.85,
    marginBottom: 2,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  msgImage: {
    maxWidth: "100%",
    maxHeight: 280,
    borderRadius: 12,
    display: "block",
    objectFit: "cover",
  },
  msgAudio: { maxWidth: 240, height: 36 },
  bubbleTime: {
    fontSize: 10.5,
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
  },
  replyBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface-2)",
  },
  replyBarLine: { width: 3, alignSelf: "stretch", background: "var(--accent)", borderRadius: 2 },
  replyBarLabel: { fontSize: 11.5, color: "var(--accent)", fontWeight: 600 },
  replyBarText: {
    fontSize: 12.5,
    color: "var(--text-muted)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  replyBarClose: { background: "transparent", border: "none", color: "var(--text-faint)", fontSize: 14 },
  mediaSendingBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 20px",
    fontSize: 12.5,
    color: "var(--text-muted)",
    borderTop: "1px solid var(--border)",
  },
  recordingBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
  },
  recordCancelBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "50%",
    width: 36,
    height: 36,
    fontSize: 14,
    color: "var(--text)",
    flexShrink: 0,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--danger)",
    animation: "ringPulse 1.2s ease-in-out infinite",
    flexShrink: 0,
  },
  recordingTime: { fontSize: 14, fontWeight: 700, color: "var(--text)", flexShrink: 0 },
  recordingHint: { flex: 1, fontSize: 13, color: "var(--text-muted)" },
  recordSendBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 16,
    flexShrink: 0,
  },
  inputBar: {
    display: "flex",
    gap: 8,
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
    alignItems: "center",
  },
  mediaBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 16,
    color: "var(--text)",
    flexShrink: 0,
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
