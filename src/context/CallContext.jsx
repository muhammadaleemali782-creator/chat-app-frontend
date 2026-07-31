import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { getSocket } from "../socket";
import { useAuth } from "./AuthContext.jsx";
import api from "../api";

const CallContext = createContext(null);

// STUN + free public TURN server - peer-to-peer connection banane ke liye zaroori.
// TURN zaroori hai jab dono log alag-alag networks (WiFi/mobile data) pe hon -
// bina TURN ke sirf same/simple network pe hi call connect hoti hai.
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export function CallProvider({ children }) {
  const { user } = useAuth();
  const [callState, setCallState] = useState("idle"); // idle | outgoing | incoming | in-call
  const [callType, setCallType] = useState("video"); // audio | video
  const [otherUser, setOtherUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callError, setCallError] = useState("");

  const pcRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const conversationIdRef = useRef(null);
  const amICallerRef = useRef(false);
  const callStartRef = useRef(null);
  const callTypeRef = useRef("video");

  const cleanup = useCallback(
    (explicitStatus) => {
      // Sirf jisne call shuru ki thi wo hi log save karta hai - taaki 2 baar record na ho
      // (dono side eventually cleanup() call karte hain: khud se ya doosre ke "call:ended" se)
      if (amICallerRef.current && conversationIdRef.current && otherUserIdRef.current) {
        const status = explicitStatus || (callStartRef.current ? "completed" : "missed");
        const durationSeconds = callStartRef.current
          ? Math.round((Date.now() - callStartRef.current) / 1000)
          : 0;
        api
          .post("/calls", {
            conversationId: conversationIdRef.current,
            calleeId: otherUserIdRef.current,
            callType: callTypeRef.current,
            status,
            durationSeconds,
          })
          .catch(() => {});
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      setLocalStream(null);
      setRemoteStream(null);
      setCallState("idle");
      setOtherUser(null);
      setIsMuted(false);
      setIsCameraOff(false);
      pendingOfferRef.current = null;
      otherUserIdRef.current = null;
      conversationIdRef.current = null;
      amICallerRef.current = false;
      callStartRef.current = null;
    },
    [localStream]
  );

  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        getSocket()?.emit("call:ice-candidate", {
          toUserId: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Debug ke liye: browser console (F12) mein ye connection ka status dikhayega.
    // "connected" ya "completed" aana chahiye agar call sahi se ban rahi hai.
    // "failed" ya "disconnected" aaye to TURN/network issue hai.
    pc.oniceconnectionstatechange = () => {
      console.log("[Call] ICE connection state:", pc.iceConnectionState);
    };
    pc.onconnectionstatechange = () => {
      console.log("[Call] Peer connection state:", pc.connectionState);
    };

    pcRef.current = pc;
    return pc;
  }, []);

  // ---- Outgoing call shuru karo ----
  const startCall = useCallback(
    async (targetUser, conversationId, type) => {
      try {
        setCallError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video",
        });
        setLocalStream(stream);
        setCallType(type);
        callTypeRef.current = type;
        setOtherUser(targetUser);
        otherUserIdRef.current = targetUser._id;
        conversationIdRef.current = conversationId;
        amICallerRef.current = true;
        setCallState("outgoing");

        const pc = createPeerConnection(targetUser._id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        getSocket()?.emit("call:invite", {
          toUserId: targetUser._id,
          conversationId,
          callType: type,
          offer,
          callerName: user.displayName,
        });
      } catch (err) {
        console.error(err);
        setCallError("Camera/mic access nahi mila. Browser permissions check karo.");
        cleanup();
      }
    },
    [createPeerConnection, cleanup, user]
  );

  // ---- Incoming call accept karo ----
  const acceptCall = useCallback(async () => {
    try {
      setCallError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      setLocalStream(stream);

      const pc = createPeerConnection(otherUserIdRef.current);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      getSocket()?.emit("call:answer", {
        toUserId: otherUserIdRef.current,
        answer,
      });

      setCallState("in-call");
    } catch (err) {
      console.error(err);
      setCallError("Camera/mic access nahi mila. Browser permissions check karo.");
      cleanup();
    }
  }, [callType, createPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    getSocket()?.emit("call:reject", { toUserId: otherUserIdRef.current });
    cleanup();
  }, [cleanup]);

  const endCall = useCallback(() => {
    if (otherUserIdRef.current) {
      getSocket()?.emit("call:end", { toUserId: otherUserIdRef.current });
    }
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted((v) => !v);
  }, [localStream, isMuted]);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => (t.enabled = isCameraOff));
    setIsCameraOff((v) => !v);
  }, [localStream, isCameraOff]);

  // ---- Socket listeners (global - kisi bhi screen pe incoming call sunni chahiye) ----
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onIncoming = ({ fromUserId, conversationId, callType: type, offer, callerName }) => {
      // Agar pehle se kisi call mein hain, to naya incoming call ignore karo
      setCallState((prev) => {
        if (prev !== "idle") return prev;
        pendingOfferRef.current = offer;
        otherUserIdRef.current = fromUserId;
        conversationIdRef.current = conversationId;
        amICallerRef.current = false;
        setCallType(type);
        callTypeRef.current = type;
        setOtherUser({ _id: fromUserId, displayName: callerName || "Unknown" });
        return "incoming";
      });
    };

    const onAnswer = async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        callStartRef.current = Date.now();
        setCallState("in-call");
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      }
    };

    const onRejected = () => {
      setCallError("Doosre user ne call reject kar di");
      cleanup("rejected");
    };

    const onEnded = () => {
      cleanup();
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
    };
  }, [cleanup, user?.id]);

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        otherUser,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        callError,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        clearCallError: () => setCallError(""),
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
