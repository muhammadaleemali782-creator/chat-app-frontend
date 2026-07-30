import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

export function connectSocket(token) {
  if (socket) return socket;

  socket = io(API_URL, {
    auth: { token },
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
