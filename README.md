# Chat App Frontend

React + Vite se banaya gaya, dark theme, mobile-friendly.

## Setup (Local mein chalane ke liye)

### 1. Backend pehle chalu karo
Backend README follow karo — MongoDB Atlas connect, `npm run dev` se backend chalao (`http://localhost:5000` pe).

### 2. Environment file
```bash
cp .env.example .env
```
`.env` mein `VITE_API_URL=http://localhost:5000` hi rehne do (local ke liye).

### 3. Install aur run
```bash
npm install
npm run dev
```
Browser mein `http://localhost:5173` khulega.

## Try karo
1. "Naya account banao" pe jaake register karo (naam, username, password)
2. Doosri browser tab (ya incognito) mein doosra account banao
3. Pehle account se, search box mein doosre account ka username dhundo aur click karo
4. Message bhejo — dusri tab mein turant (real-time) aana chahiye

## Deploy karne ke liye (baad mein)
- Vercel pe naya project banao, is repo ko connect karo
- Environment variable `VITE_API_URL` mein apna Render backend ka URL daalo
- Backend ke `.env` mein `FRONTEND_URL` ko apne Vercel URL se update karo (CORS ke liye)

## Structure
```
src/
  api.js              → backend se baat karne ka setup (axios)
  socket.js           → real-time connection (socket.io)
  context/AuthContext → login state pura app mein
  pages/Login.jsx
  pages/Register.jsx
  pages/Chat.jsx      → main screen (sidebar + chat window jodta hai)
  components/Sidebar.jsx     → chat list + username search
  components/ChatWindow.jsx  → messages + input box
```
