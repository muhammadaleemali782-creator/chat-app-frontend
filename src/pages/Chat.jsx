import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api";
import { getSocket } from "../socket";
import { useAuth } from "../context/AuthContext.jsx";
import { usePresence } from "../context/PresenceContext.jsx";
import { playNotificationSound } from "../utils/sounds";
import { showLocalNotification } from "../utils/notifications";
import { useBackHandler } from "../utils/backHandlerStack";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import IconRail from "../components/IconRail.jsx";
import CalendarPage from "./CalendarPage.jsx";
import CallsPage from "./CallsPage.jsx";
import Profile from "./Profile.jsx";

export default function Chat() {
  const [page, setPage] = useState("chat"); // chat | calendar | calls
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  const { user } = useAuth();
  const { seedOnline } = usePresence();
  const [showProfile, setShowProfile] = useState(false);

  // Back button: mobile pe chat khuli ho to list pe wapas jao (app cut na ho)
  useBackHandler(
    "chat-mobile-view",
    mobileView === "chat" && page === "chat",
    useCallback(() => {
      setMobileView("list");
      return true;
    }, [])
  );

  // Back button: calendar/calls page khula ho to chat pe wapas jao
  useBackHandler(
    "chat-subpage",
    page !== "chat",
    useCallback(() => {
      setPage("chat");
      return true;
    }, [])
  );

  // Back button: profile modal khula ho to usse band karo
  useBackHandler(
    "profile-modal",
    showProfile,
    useCallback(() => {
      setShowProfile(false);
      return true;
    }, [])
  );

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
      // Jo participants abhi online the (last known), unse presence seed kar dete hain
      const onlineIds = res.data
        .flatMap((c) => c.participants)
        .filter((p) => p.isOnline)
        .map((p) => p._id);
      if (onlineIds.length) seedOnline(onlineIds);
    } finally {
      setLoadingConversations(false);
    }
  }, [seedOnline]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // GroupInfoModal se aane wale events - group settings/members badle ya user ne
  // group chhod diya, to yahan state sync karo
  useEffect(() => {
    const handleGroupUpdated = (e) => {
      const updated = e.detail;
      setConversations((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setActiveConv((prev) => (prev?._id === updated._id ? updated : prev));
    };
    const handleGroupLeft = (e) => {
      const groupId = e.detail;
      setConversations((prev) => prev.filter((c) => c._id !== groupId));
      setActiveConv((prev) => (prev?._id === groupId ? null : prev));
      setMobileView("list");
    };
    window.addEventListener("group-updated", handleGroupUpdated);
    window.addEventListener("group-left", handleGroupLeft);
    return () => {
      window.removeEventListener("group-updated", handleGroupUpdated);
      window.removeEventListener("group-left", handleGroupLeft);
    };
  }, []);

  // Real-time: naya message aaye to state update karo
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const previewFor = (m) =>
      m.type === "image" ? "📷 Photo" : m.type === "audio" ? "🎤 Voice message" : m.text;

    const handleReceive = (message) => {
      // Apna khud ka bheja hua message echo hoke wapas aata hai (dusri tab sync ke liye) -
      // uspe beep nahi bajani, sirf doosre ke message pe bajani hai
      if (message.sender !== user.id) {
        playNotificationSound();
        const senderConv = conversationsRef.current.find((c) => c._id === message.conversation);
        const senderName =
          senderConv?.participants?.find((p) => p._id === message.sender)?.displayName ||
          "Naya message";
        const preview = previewFor(message);
        showLocalNotification(senderName, preview);
      }

      setMessages((prev) => {
        if (activeConv && message.conversation === activeConv._id) {
          // Chat khuli hui hai aur naya message aaya - turant "read" mark kar do
          if (message.sender !== user.id) {
            const socket = getSocket();
            socket?.emit("mark_read", { conversationId: activeConv._id });
          }
          return [...prev, message];
        }
        return prev;
      });

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === message.conversation);
        if (idx === -1) {
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: previewFor(message),
          lastMessageAt: message.createdAt,
        };
        // Sabse recent chat upar le aao
        const [moved] = updated.splice(idx, 1);
        return [moved, ...updated];
      });
    };

    // Doosra bandaa online mila aur message "delivered" ho gaya (single -> double grey tick)
    const handleStatus = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m))
      );
    };

    // Doosre ne chat khol ke mera message padh liya (double grey -> blue tick + time)
    const handleMessagesRead = ({ messageIds, readAt }) => {
      const idSet = new Set(messageIds.map((id) => id.toString()));
      setMessages((prev) =>
        prev.map((m) => (idSet.has(m._id.toString()) ? { ...m, status: "read", readAt } : m))
      );
    };

    // Kisi ne apna message delete kar diya - list se hata do
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("receive_message", handleReceive);
    socket.on("message_status", handleStatus);
    socket.on("messages_read", handleMessagesRead);
    socket.on("message_deleted", handleMessageDeleted);
    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("message_status", handleStatus);
      socket.off("messages_read", handleMessagesRead);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [activeConv, loadConversations, user]);

  // Jab bhi koi chat kholi jaaye, uske unread messages "read" mark kar do
  useEffect(() => {
    if (!activeConv) return;
    const socket = getSocket();
    socket?.emit("mark_read", { conversationId: activeConv._id });
  }, [activeConv]);

  const handleSelectConversation = async (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/${conv._id}`);
      setMessages(res.data);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async (conv) => {
    if (!window.confirm(`"${conv.participants.find((p) => p._id !== user.id)?.displayName}" ke saath ki chat delete karein?`)) {
      return;
    }
    try {
      await api.delete(`/conversations/${conv._id}`);
      setConversations((prev) => prev.filter((c) => c._id !== conv._id));
      if (activeConv?._id === conv._id) {
        setActiveConv(null);
        setMessages([]);
        setMobileView("list");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Chat delete nahi ho payi, dobara try karo");
    }
  };

  const handleGroupCreated = (group) => {
    setConversations((prev) => [group, ...prev]);
    handleSelectConversation(group);
  };

  const handleNewConversation = async (otherUser) => {
    const res = await api.post("/conversations/start", { otherUserId: otherUser._id });
    const conv = res.data;

    // Populate participants manually taaki UI turant sahi dikhe
    const populatedConv = {
      ...conv,
      participants: [
        { _id: user.id, displayName: user.displayName, username: user.username },
        otherUser,
      ],
    };

    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conv._id);
      return exists ? prev : [populatedConv, ...prev];
    });

    handleSelectConversation(populatedConv);
  };

  const handleSend = (payload) => {
    const socket = getSocket();
    if (!socket || !activeConv) return;
    // payload ya to seedha text (string) ho sakta hai, ya {text, type, mediaData,
    // mediaMimeType, replyTo} wala object (photo/voice-note/reply ke liye)
    const data =
      typeof payload === "string"
        ? { conversationId: activeConv._id, text: payload }
        : { conversationId: activeConv._id, ...payload };
    socket.emit("send_message", data);
  };

  return (
    <div style={styles.outerWrap} className="chat-layout">
      <IconRail
        page={page}
        onPageChange={(p) => {
          setPage(p);
          setMobileView("list");
        }}
        hideOnMobileChat={page === "chat" && mobileView === "chat"}
        onOpenProfile={() => setShowProfile(true)}
      />

      {showProfile && <Profile onClose={() => setShowProfile(false)} />}

      {page === "chat" && (
        <div style={styles.wrap} className="chat-grid page-content">
          <div
            style={{
              ...styles.sidebarPane,
              display: mobileView === "list" ? "block" : undefined,
            }}
            className={mobileView === "chat" ? "hide-on-mobile" : ""}
          >
            <Sidebar
              conversations={conversations}
              activeId={activeConv?._id}
              onSelect={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onGroupCreated={handleGroupCreated}
              onDeleteConversation={handleDeleteConversation}
              loading={loadingConversations}
            />
          </div>

          <div
            style={styles.chatPane}
            className={mobileView === "list" ? "hide-on-mobile" : ""}
          >
            {activeConv ? (
              <ChatWindow
                conversation={activeConv}
                messages={messages}
                onSend={handleSend}
                onBack={() => setMobileView("list")}
                loading={loadingMessages}
              />
            ) : (
              <div style={styles.placeholder}>
                Chat shuru karne ke liye left se kisi ko select karo, ya naya user dhundo.
              </div>
            )}
          </div>
        </div>
      )}

      {page === "calendar" && (
        <div style={styles.fullPane} className="page-content">
          <CalendarPage />
        </div>
      )}

      {page === "calls" && (
        <div style={styles.fullPane} className="page-content">
          <CallsPage />
        </div>
      )}
    </div>
  );
}

const styles = {
  outerWrap: {
    display: "flex",
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  wrap: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
  },
  sidebarPane: { minWidth: 0, minHeight: 0, height: "100%", overflow: "hidden" },
  chatPane: { minWidth: 0, minHeight: 0, height: "100%", overflow: "hidden" },
  fullPane: { flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" },
  placeholder: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    fontSize: 14,
    padding: 40,
    textAlign: "center",
  },
};

