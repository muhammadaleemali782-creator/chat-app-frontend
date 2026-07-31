import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSocket } from "../socket";
import { useAuth } from "./AuthContext.jsx";

const PresenceContext = createContext(null);

// Kaun-kaun se users abhi online hain, real-time mein track karta hai
export function PresenceProvider({ children }) {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState(() => new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onOnline = ({ userId }) => {
      setOnlineIds((prev) => new Set(prev).add(userId));
    };
    const onOffline = ({ userId }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on("user_online", onOnline);
    socket.on("user_offline", onOffline);

    return () => {
      socket.off("user_online", onOnline);
      socket.off("user_offline", onOffline);
    };
  }, [user?.id]);

  // Initial load ke waqt API se mile stale data ko seed karne ke liye
  const seedOnline = useCallback((userIds) => {
    setOnlineIds((prev) => {
      const next = new Set(prev);
      userIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const isOnline = useCallback((userId) => onlineIds.has(userId), [onlineIds]);

  return (
    <PresenceContext.Provider value={{ isOnline, seedOnline }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  return useContext(PresenceContext);
}
