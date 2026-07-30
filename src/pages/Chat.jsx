import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { getSocket } from "../socket";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"
  const { user } = useAuth();

  const loadConversations = useCallback(async () => {
    const res = await api.get("/conversations");
    setConversations(res.data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Real-time: naya message aaye to state update karo
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceive = (message) => {
      setMessages((prev) => {
        if (activeConv && message.conversation === activeConv._id) {
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
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
        };
        // Sabse recent chat upar le aao
        const [moved] = updated.splice(idx, 1);
        return [moved, ...updated];
      });
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [activeConv, loadConversations]);

  const handleSelectConversation = async (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
    const res = await api.get(`/messages/${conv._id}`);
    setMessages(res.data);
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

  const handleSend = (text) => {
    const socket = getSocket();
    if (!socket || !activeConv) return;
    socket.emit("send_message", { conversationId: activeConv._id, text });
  };

  return (
    <div style={styles.wrap} className="chat-layout">
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
          />
        ) : (
          <div style={styles.placeholder}>
            Chat shuru karne ke liye left se kisi ko select karo, ya naya user dhundo.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    height: "100vh",
  },
  sidebarPane: { minWidth: 0, height: "100%" },
  chatPane: { minWidth: 0, height: "100%" },
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
