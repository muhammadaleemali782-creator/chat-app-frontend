import { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext.jsx";
import { avatarColor } from "../utils/avatarColor";

export default function CallOverlay() {
  const {
    callState,
    callType,
    otherUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callError,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    clearCallError,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (callType === "video" && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (callType === "audio" && remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  // Error toast - thodi der dikha ke gayab ho jaata hai
  useEffect(() => {
    if (callError) {
      const t = setTimeout(clearCallError, 4000);
      return () => clearTimeout(t);
    }
  }, [callError, clearCallError]);

  if (callState === "idle" && !callError) return null;

  const color = avatarColor(otherUser?.displayName || "");
  const initial = (otherUser?.displayName || "?").charAt(0).toUpperCase();

  if (callState === "idle" && callError) {
    return (
      <div style={styles.errorToast}>{callError}</div>
    );
  }

  return (
    <div style={styles.overlay}>
      {(callState === "incoming" || callState === "outgoing") && (
        <div style={styles.centerCard}>
          <div
            style={{
              ...styles.bigAvatar,
              background: color.bg,
              color: color.fg,
            }}
          >
            {initial}
          </div>
          <div style={styles.callerName}>{otherUser?.displayName}</div>
          <div style={styles.callStatusText}>
            {callState === "incoming"
              ? `Aap ko ${callType === "video" ? "video" : "audio"} call kar raha/rahi hai`
              : "Ring ho raha hai..."}
          </div>

          {callState === "incoming" ? (
            <div style={styles.actionRow}>
              <button style={{ ...styles.actionBtn, ...styles.rejectBtn }} onClick={rejectCall}>
                ✕
              </button>
              <button style={{ ...styles.actionBtn, ...styles.acceptBtn }} onClick={acceptCall}>
                ✓
              </button>
            </div>
          ) : (
            <div style={styles.actionRow}>
              <button style={{ ...styles.actionBtn, ...styles.rejectBtn }} onClick={endCall}>
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {callState === "in-call" && (
        <div style={styles.inCallWrap}>
          {callType === "video" ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={styles.remoteVideo}
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={styles.localVideo}
              />
            </>
          ) : (
            <>
              <audio ref={remoteAudioRef} autoPlay />
              <div style={styles.audioCallCenter}>
                <div
                  style={{
                    ...styles.bigAvatar,
                    background: color.bg,
                    color: color.fg,
                  }}
                >
                  {initial}
                </div>
                <div style={styles.callerName}>{otherUser?.displayName}</div>
                <div style={styles.callStatusText}>Audio call chal raha hai</div>
              </div>
            </>
          )}

          <div style={styles.inCallControls}>
            <button
              style={{
                ...styles.controlBtn,
                background: isMuted ? "var(--danger)" : "rgba(255,255,255,0.12)",
              }}
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>
            {callType === "video" && (
              <button
                style={{
                  ...styles.controlBtn,
                  background: isCameraOff ? "var(--danger)" : "rgba(255,255,255,0.12)",
                }}
                onClick={toggleCamera}
                title={isCameraOff ? "Camera on karo" : "Camera off karo"}
              >
                {isCameraOff ? "📷" : "🎥"}
              </button>
            )}
            <button
              style={{ ...styles.controlBtn, background: "var(--danger)" }}
              onClick={endCall}
              title="Call khatam karo"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,8,14,0.92)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorToast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--danger)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13.5,
    zIndex: 1001,
    boxShadow: "var(--shadow-soft)",
  },
  centerCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  bigAvatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 38,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    marginBottom: 8,
  },
  callerName: { fontSize: 20, fontWeight: 700, color: "var(--text)" },
  callStatusText: { fontSize: 14, color: "var(--text-muted)", marginBottom: 24 },
  actionRow: { display: "flex", gap: 24, marginTop: 8 },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    border: "none",
    fontSize: 22,
    color: "#fff",
  },
  acceptBtn: { background: "var(--amber)" },
  rejectBtn: { background: "var(--danger)" },
  inCallWrap: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    background: "#000",
  },
  localVideo: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 130,
    height: 170,
    objectFit: "cover",
    borderRadius: 12,
    border: "2px solid var(--border)",
    background: "#000",
  },
  audioCallCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  inCallControls: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 16,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    fontSize: 20,
    color: "#fff",
  },
};
