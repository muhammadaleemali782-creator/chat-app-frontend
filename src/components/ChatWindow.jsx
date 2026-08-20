import { useState, useEffect, useRef } from "react";
import { useBackHandler } from "../utils/backHandlerStack";
import { useAuth } from "../context/AuthContext.jsx";
import { useCall } from "../context/CallContext.jsx";
import { usePresence } from "../context/PresenceContext.jsx";
import { getSocket } from "../socket";
import api from "../api";
import { Avatar, GroupAvatar } from "./Sidebar.jsx";
import GroupInfoModal from "./GroupInfoModal.jsx";
import SheetsListModal from "./SheetsListModal.jsx";
import TaskPanel from "./TaskPanel.jsx";
import { avatarColor } from "../utils/avatarColor";
import MeetingScheduler from "./MeetingScheduler.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import ChatDetailsPanel from "./ChatDetailsPanel.jsx";
import { compressImage, blobToBase64 } from "../utils/mediaUtils";

function formatTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullDateTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1180);
  const [activeMsgMenu, setActiveMsgMenu] = useState(null);
  const longPressTimerRef = useRef(null);

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
  useBackHandler(
    "attach-menu",
    showAttachMenu,
    () => {
      setShowAttachMenu(false);
      return true;
    }
  );
  useBackHandler(
    "msg-action-menu",
    !!activeMsgMenu,
    () => {
      setActiveMsgMenu(null);
      return true;
    }
  );

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const attachMenuRef = useRef(null);
  const { user } = useAuth();
  const { startCall, callState } = useCall();
  const { isOnline } = usePresence();

  const isGroup = conversation.type === "group";
  const other = isGroup ? null : conversation.participants.find((p) => p._id !== user.id);
  const otherColor = avatarColor(other?.displayName || "");
  const isAdmin = isGroup && conversation.admins?.some((a) => (a._id || a) === user.id);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showSheets, setShowSheets] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const headerMenuRef = useRef(null);

  useBackHandler(
    "group-info",
    showGroupInfo,
    () => {
      setShowGroupInfo(false);
      return true;
    }
  );
  useBackHandler(
    "header-menu",
    showHeaderMenu,
    () => {
      setShowHeaderMenu(false);
      return true;
    }
  );
  useBackHandler(
    "sheets-panel",
    showSheets,
    () => {
      setShowSheets(false);
      return true;
    }
  );
  useBackHandler(
    "tasks-panel",
    showTasks,
    () => {
      setShowTasks(false);
      return true;
    }
  );

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

  useEffect(() => {
    if (!showAttachMenu) return;
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showAttachMenu]);

  useEffect(() => {
    if (!showHeaderMenu) return;
    const handler = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setShowHeaderMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showHeaderMenu]);

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

  const startLongPress = (messageId) => {
    cancelLongPress();
    longPressTimerRef.current = setTimeout(() => setActiveMsgMenu(messageId), 450);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Yeh message delete karna hai? Yeh dono taraf se hat jaayega.")) return;
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Delete nahi ho paya, dobara try karo");
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
    <div style={styles.outerLayout} className="pane-fade">
      <div style={styles.wrap} className="chat-main-stream">
        <div style={{ ...styles.header, position: "relative" }} className="chat-header-wave">
          <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
            <defs>
              <clipPath id="mobileChatWaveClip" clipPathUnits="objectBoundingBox">
                <path d="M 0,0 L 1,0 L 1,0.56 C 0.65,0.72 0.35,1.02 0,0.85 Z" />
              </clipPath>
              <clipPath id="mobileChatBottomWaveClip" clipPathUnits="objectBoundingBox">
                <path d="M 0,0.72 C 0.28,0.22 0.62,0.68 1,0.18 L 1,1 L 0,1 Z" />
              </clipPath>
            </defs>
          </svg>

          <button
            style={styles.backBtn}
            onClick={onBack}
            className="mobile-header-back-btn"
            aria-label="Wapas jao"
          >
            ←
          </button>

          {isGroup ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, cursor: "pointer" }}
              onClick={() => setShowGroupInfo(true)}
            >
              <GroupAvatar name={conversation.name} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={styles.headerName}>👥 {conversation.name}</div>
                <div style={styles.headerStatus}>
                  {otherTyping ? "koi type kar raha hai" : `${conversation.participants.length} members`}
                </div>
              </div>
            </div>
          ) : (
            <>
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
                    "online"
                  ) : (
                    "online"
                  )}
                </div>
              </div>
            </>
          )}

          <div style={styles.headerActions} ref={headerMenuRef} className="chat-header-actions-wrap">
            {!isGroup && (
              <>
                <button
                  style={styles.headerIconBtn}
                  className="desktop-only-btn"
                  title="Audio call"
                  disabled={callState !== "idle"}
                  onClick={() => other && startCall(other, conversation._id, "audio")}
                >
                  📞
                </button>
                <button
                  style={styles.headerIconBtn}
                  className="desktop-only-btn"
                  title="Video call"
                  disabled={callState !== "idle"}
                  onClick={() => other && startCall(other, conversation._id, "video")}
                >
                  🎥
                </button>
              </>
            )}
            <button
              type="button"
              style={{
                ...styles.headerIconBtn,
                background: showDetailsPanel ? "var(--accent-soft)" : "var(--surface-2)",
                color: showDetailsPanel ? "var(--accent)" : "var(--text)",
              }}
              className="desktop-only-btn"
              title="Toggle Details Panel"
              onClick={() => setShowDetailsPanel((v) => !v)}
            >
              ℹ️
            </button>

            {/* Mobile and Desktop Action Menu */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="mobile-header-dots-btn"
                onClick={() => setShowHeaderMenu((v) => !v)}
                title="Menu"
              >
                •••
              </button>

              {showHeaderMenu && (
                <div style={styles.headerMenu}>
                  {!isGroup && (
                    <button
                      style={styles.headerMenuItem}
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowMeetings(true);
                      }}
                    >
                      📅 Meetings
                    </button>
                  )}
                  {isGroup && (
                    <button
                      style={styles.headerMenuItem}
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowGroupInfo(true);
                      }}
                    >
                      ℹ️ Group Info
                    </button>
                  )}
                  <button
                    style={styles.headerMenuItem}
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowSheets(true);
                    }}
                  >
                    📊 Files
                  </button>
                  <button
                    style={styles.headerMenuItem}
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowTasks(true);
                    }}
                  >
                    📋 Tasks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>






        {showMeetings && !isGroup && (
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

        {showGroupInfo && (
          <GroupInfoModal
            conversation={conversation}
            onClose={() => setShowGroupInfo(false)}
            onUpdated={(updated) => {
              // Parent Chat.jsx conversation state ko sync karne ke liye event bhejte hain
              window.dispatchEvent(new CustomEvent("group-updated", { detail: updated }));
            }}
            onLeft={() => {
              setShowGroupInfo(false);
              window.dispatchEvent(new CustomEvent("group-left", { detail: conversation._id }));
              onBack?.();
            }}
          />
        )}

        {showSheets && (
          <SheetsListModal conversationId={conversation._id} onClose={() => setShowSheets(false)} />
        )}

        {showTasks && (
          <TaskPanel conversationId={conversation._id} onClose={() => setShowTasks(false)} />
        )}

        <div style={styles.messages}>

        {loading && <LoadingScreen small message="" />}
        {!loading && messages.length === 0 && (
          <div style={styles.emptyChat}>
            <div style={styles.emptyChatIcon}>👋</div>
            {isGroup ? conversation.name : other?.displayName} ke saath abhi tak koi message nahi hai.
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
            const senderName = isGroup
              ? conversation.participants.find((p) => p._id === (m.sender?._id || m.sender))
                  ?.displayName
              : null;

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
                    ...styles.bubbleCol,
                    alignItems: isMine ? "flex-end" : "flex-start",
                    marginLeft: isMine ? "auto" : 0,
                    marginRight: isMine ? 0 : "auto",
                  }}
                >
                  {isGroup && !isMine && senderName && (
                    <span style={styles.groupSenderName}>{senderName}</span>
                  )}
                  <div
                    style={{
                      ...styles.bubble,
                      background: isMine
                        ? "linear-gradient(135deg, #0C7872 0%, #13ADA3 100%)"
                        : "#DCF5F3",
                      color: isMine ? "#fff" : "#0D4A47",
                      border: isMine ? "none" : "none",
                      borderBottomRightRadius: isMine ? 4 : 18,
                      borderBottomLeftRadius: isMine ? 18 : 4,
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveMsgMenu(m._id);
                    }}
                    onTouchStart={() => startLongPress(m._id)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(m._id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
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
                    {m.type !== "image" && m.type !== "audio" && <span style={styles.msgText}>{m.text}</span>}
                    {(m.type === "image" || m.type === "audio") && m.text && (
                      <span style={styles.msgText}>{m.text}</span>
                    )}
                  </div>

                  {/* Time hamesha bubble ke NEECHE dikhta hai, jis side bubble hai usi side aligned */}
                  <div style={styles.timeRow}>
                    <span style={styles.timeBelow}>{formatTime(m.createdAt)}</span>
                    <StatusTicks status={m.status} isMine={isMine} readAt={m.readAt} />
                  </div>

                  {activeMsgMenu === m._id && (
                    <div style={styles.msgMenuBackdrop} onClick={() => setActiveMsgMenu(null)}>
                      <div
                        style={{
                          ...styles.msgMenu,
                          alignItems: isMine ? "flex-end" : "flex-start",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={styles.msgMenuInfo}>
                          Bheja gaya: {formatFullDateTime(m.createdAt)}
                          {m.readAt && (
                            <>
                              <br />
                              Padha gaya: {formatFullDateTime(m.readAt)}
                            </>
                          )}
                        </div>
                        <button
                          style={styles.msgMenuBtn}
                          onClick={() => {
                            setReplyingTo(m);
                            setActiveMsgMenu(null);
                          }}
                        >
                          ↩ Reply karo
                        </button>
                        {isMine && (m.type === "image" || m.type === "audio" || m.type === "text") && (
                          <button
                            style={{ ...styles.msgMenuBtn, color: "var(--danger)" }}
                            onClick={() => {
                              setActiveMsgMenu(null);
                              handleDeleteMessage(m._id);
                            }}
                          >
                            🗑 Delete karo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Other typing avatar with three dots bubble (like reference image) */}
        {otherTyping && (
          <div className="mobile-typing-indicator-row">
            <Avatar name={other?.displayName} color={otherColor} size={26} />
            <div className="mobile-typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {replyingTo && (
        <div style={styles.replyBar}>
          <div style={styles.replyBarLine} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.replyBarLabel}>
              {replyingTo.sender === user.id || replyingTo.sender?._id === user.id
                ? "Apne message ka reply"
                : `${
                    conversation.participants.find(
                      (p) => p._id === (replyingTo.sender?._id || replyingTo.sender)
                    )?.displayName || other?.displayName || "Unke"
                  } message ka reply`}
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
        <div className="chat-mobile-bottom-wave-container">
          <svg
            viewBox="0 0 500 130"
            preserveAspectRatio="none"
            className="chat-mobile-bottom-svg-wave"
          >
            <defs>
              <linearGradient id="bottomWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#106662" />
                <stop offset="40%" stopColor="#157E77" />
                <stop offset="75%" stopColor="#1EA297" />
                <stop offset="100%" stopColor="#136F69" />
              </linearGradient>
              <filter id="bottomWaveShadow" x="-5%" y="-15%" width="110%" height="130%">
                <feDropShadow dx="0" dy="-3" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
              </filter>
            </defs>
            <path
              d="M 0,65 C 60,60 110,24 165,24 C 230,24 260,68 335,68 C 400,68 440,16 500,16 L 500,130 L 0,130 Z"
              fill="url(#bottomWaveGradient)"
              filter="url(#bottomWaveShadow)"
            />
          </svg>

          <form style={styles.inputBar} className="chat-mobile-input-bar" onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handlePhotoSelected}
            />

            <div className="chat-mobile-input-inner-box">
              <input
                style={styles.input}
                className="chat-mobile-text-input"
                value={text}
                onChange={handleChange}
                placeholder="Type your message here..."
              />

              <button
                type="button"
                className="chat-mobile-action-icon"
                onClick={handlePhotoPick}
                title="Photo bhejo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>

              <div style={{ position: "relative" }} ref={attachMenuRef}>
                {showAttachMenu && (
                  <div style={styles.attachMenu} className="attach-menu">
                    <button
                      type="button"
                      style={styles.attachMenuItem}
                      onClick={() => {
                        setShowAttachMenu(false);
                        handlePhotoPick();
                      }}
                    >
                      📷 Photo
                    </button>
                    <button
                      type="button"
                      style={styles.attachMenuItem}
                      onClick={() => {
                        setShowAttachMenu(false);
                        startRecording();
                      }}
                    >
                      🎤 Voice message
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="chat-mobile-action-icon"
                  title="Attachment / Voice"
                  onClick={() => setShowAttachMenu((v) => !v)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </button>
              </div>
            </div>

            <button
              className="send-btn chat-mobile-send-btn"
              style={styles.sendBtn}
              type="submit"
              disabled={!text.trim()}
              title="Bhejo"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2.5L10.5 13.5M21.5 2.5L14.5 21.5C14.3 22 13.7 22.3 13.2 22C12.8 21.8 12.5 21.4 12.4 21L9.5 14.5L3 11.6C2.5 11.4 2.2 10.8 2.5 10.3C2.7 9.9 3.1 9.6 3.5 9.5L21.5 2.5Z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      </div>{/* closes styles.wrap */}

      {showDetailsPanel && (
        <ChatDetailsPanel
          conversation={conversation}
          messages={messages}
          onClose={() => setShowDetailsPanel(false)}
          onOpenFiles={() => setShowSheets(true)}
        />
      )}
    </div>
  );
}

const styles = {
  outerLayout: {
    display: "flex",
    flex: 1,
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    background: "#FFFFFF",
    borderRadius: "0 28px 28px 0",
  },
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    background: "#FFFFFF",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 22px",
    borderBottom: "1px solid #F1F5F9",
    background: "#FFFFFF",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#0F172A",
    fontSize: 20,
    display: "none",
    marginRight: 2,
    padding: 4,
  },
  headerName: { fontSize: 15, fontWeight: 700, color: "#0F172A" },
  headerStatus: { fontSize: 12.5, color: "#64748B" },
  headerActions: { display: "flex", gap: 6, flexShrink: 0 },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    fontSize: 15,
    color: "#0F172A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 170,
    zIndex: 35,
  },
  headerMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "#0F172A",
    borderRadius: 8,
    padding: "10px 10px",
    fontSize: 13.5,
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#FFFFFF",
  },
  emptyChat: {
    margin: "auto",
    color: "#64748B",
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
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontSize: 11.5,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 20,
  },
  bubbleRow: { display: "flex", alignItems: "flex-end", gap: 4 },
  bubbleCol: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    maxWidth: "78%",
    width: "fit-content",
  },
  groupSenderName: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#4F46E5",
    padding: "0 4px",
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: "0 4px",
  },
  timeBelow: { fontSize: 11, color: "#94A3B8" },
  msgMenuBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 45,
  },
  msgMenu: {
    position: "relative",
    marginTop: 6,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    padding: 8,
    minWidth: 200,
    zIndex: 46,
  },
  msgMenuInfo: {
    fontSize: 11.5,
    color: "#64748B",
    padding: "4px 8px 8px",
    borderBottom: "1px solid #F1F5F9",
    lineHeight: 1.6,
  },
  msgMenuBtn: {
    background: "transparent",
    border: "none",
    color: "#0F172A",
    fontSize: 13,
    padding: "8px 8px",
    textAlign: "left",
    borderRadius: 8,
    width: "100%",
    cursor: "pointer",
  },
  replyIconBtn: {
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontSize: 13,
    padding: 4,
    opacity: 0.55,
    flexShrink: 0,
    cursor: "pointer",
  },
  bubble: {
    maxWidth: "75%",
    width: "fit-content",
    minWidth: 48,
    padding: "10px 16px",
    borderRadius: 18,
    fontSize: 14.5,
    lineHeight: 1.45,
    wordBreak: "normal",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  msgText: {
    wordBreak: "normal",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    display: "inline-block",
    maxWidth: "100%",
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
    borderTop: "1px solid #F1F5F9",
    background: "#F8FAFC",
  },
  replyBarLine: { width: 3, alignSelf: "stretch", background: "#4F46E5", borderRadius: 2 },
  replyBarLabel: { fontSize: 11.5, color: "#4F46E5", fontWeight: 600 },
  replyBarText: {
    fontSize: 12.5,
    color: "#64748B",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  replyBarClose: { background: "transparent", border: "none", color: "#94A3B8", fontSize: 14, cursor: "pointer" },
  mediaSendingBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 20px",
    fontSize: 12.5,
    color: "#64748B",
    borderTop: "1px solid #F1F5F9",
    background: "#F8FAFC",
  },
  recordingBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    borderTop: "1px solid #F1F5F9",
    background: "#FFFFFF",
  },
  recordCancelBtn: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "50%",
    width: 36,
    height: 36,
    fontSize: 14,
    color: "#0F172A",
    flexShrink: 0,
    cursor: "pointer",
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#EF4444",
    animation: "ringPulse 1.2s ease-in-out infinite",
    flexShrink: 0,
  },
  recordingTime: { fontSize: 14, fontWeight: 700, color: "#0F172A", flexShrink: 0 },
  recordingHint: { flex: 1, fontSize: 13, color: "#64748B" },
  recordSendBtn: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 16,
    flexShrink: 0,
    cursor: "pointer",
  },
  inputBar: {
    display: "flex",
    gap: 8,
    padding: "12px 18px",
    background: "#FFFFFF",
    alignItems: "center",
    borderTop: "1px solid #F1F5F9",
  },
  attachMenu: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 180,
    zIndex: 30,
  },
  attachMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "#0F172A",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13.5,
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
  },
  mediaBtn: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "50%",
    width: 38,
    height: 38,
    fontSize: 16,
    color: "#64748B",
    flexShrink: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minWidth: 0,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 24,
    padding: "11px 18px",
    color: "#0F172A",
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #0C7872 0%, #13ADA3 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 38,
    height: 38,
    fontSize: 15,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(13, 173, 163, 0.35)",
  },
};


