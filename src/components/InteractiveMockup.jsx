import { useState } from "react";

export default function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Sarah Jenkins",
      initials: "SJ",
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      text: "Hey team! Is the new Chatox release ready? 🚀",
      time: "10:42 AM",
      isMe: false
    },
    {
      id: 2,
      sender: "You",
      initials: "ME",
      gradient: "linear-gradient(135deg, #2563eb, #0ea5e9)",
      text: "Yes! 100% private, no phone numbers needed. Real-time WebSockets are blazing fast ⚡",
      time: "10:43 AM",
      isMe: true
    },
    {
      id: 3,
      sender: "Alex Rivera",
      initials: "AR",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      text: "Check out the sprint sheet I attached inside our group:",
      time: "10:44 AM",
      isMe: false,
      attachment: { type: "sheet", name: "Q3_Roadmap_V2.sheet", size: "24 KB" }
    },
    {
      id: 4,
      sender: "You",
      initials: "ME",
      gradient: "linear-gradient(135deg, #2563eb, #0ea5e9)",
      text: "Awesome! Let's jump on a quick HD video call at 11 AM.",
      time: "10:45 AM",
      isMe: true
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "You",
      initials: "ME",
      gradient: "linear-gradient(135deg, #2563eb, #0ea5e9)",
      text: chatInput,
      time: "Just now",
      isMe: true
    };
    setMessages([...messages, newMsg]);
    setChatInput("");
  };

  const sheetItems = [
    { module: "End-to-End WebSocket Relay", owner: "@alex_dev", status: "Completed", statusType: "done", est: "14 hrs", date: "Aug 18" },
    { module: "WebRTC Group Video Rooms", owner: "@sarah_lead", status: "In Progress", statusType: "progress", est: "22 hrs", date: "Aug 22" },
    { module: "Biometric PIN Gate Shield", owner: "@you", status: "Verified", statusType: "done", est: "8 hrs", date: "Aug 19" },
    { module: "Capacitor Push Notifications", owner: "@rohan_qa", status: "Testing", statusType: "review", est: "10 hrs", date: "Aug 25" }
  ];

  return (
    <div className="mockup-shell">
      {/* 1. Chrome Top Bar with No-Scroll Responsive Tabs */}
      <div className="mockup-header-bar">
        <div className="mockup-dots hide-on-mobile">
          <span className="mockup-dot mockup-dot-red" />
          <span className="mockup-dot mockup-dot-yellow" />
          <span className="mockup-dot mockup-dot-green" />
        </div>

        {/* 4-Segment Grid Tabs - 100% Width on Mobile, Zero Scroll */}
        <div className="mockup-nav-tabs">
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <span className="tab-icon">💬</span>
            <span className="tab-label-desktop">Live Chat</span>
            <span className="tab-label-mobile">Chat</span>
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "calls" ? "active" : ""}`}
            onClick={() => setActiveTab("calls")}
          >
            <span className="tab-icon">📹</span>
            <span className="tab-label-desktop">HD Video</span>
            <span className="tab-label-mobile">Video</span>
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "sheets" ? "active" : ""}`}
            onClick={() => setActiveTab("sheets")}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label-desktop">Smart Sheets</span>
            <span className="tab-label-mobile">Sheets</span>
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-label-desktop">Calendar</span>
            <span className="tab-label-mobile">Meet</span>
          </button>
        </div>

        <div className="mockup-demo-pill hide-on-mobile">
          <span className="online-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          <span>Interactive Live Demo</span>
        </div>
      </div>

      {/* 2. Main Mockup Body */}
      <div className="mockup-content-body">
        {/* TAB 1: LIVE CHAT */}
        {activeTab === "chat" && (
          <div className="mockup-chat-layout">
            {/* Desktop Channel Sidebar */}
            <div className="mockup-sidebar hide-on-mobile">
              <div className="mockup-sidebar-header">
                <span style={{ fontWeight: 700, fontSize: 13 }}>Direct Channels</span>
                <span className="mockup-badge-pill">4 Online</span>
              </div>
              <div className="mockup-sidebar-list">
                {[
                  { name: "Product Design Guild", msg: "Alex: Sheet attached", time: "10:44 AM", active: true, unread: 2, initials: "PD", color: "#2563eb" },
                  { name: "Sarah Jenkins", msg: "Voice note received", time: "10:15 AM", active: false, unread: 0, initials: "SJ", color: "#0ea5e9" },
                  { name: "Dev Core Team", msg: "Sprint sync at 3pm", time: "Yesterday", active: false, unread: 0, initials: "DC", color: "#10b981" },
                  { name: "Rohan Patel", msg: "Hey, are you free?", time: "2d ago", active: false, unread: 0, initials: "RP", color: "#f59e0b" }
                ].map((item, i) => (
                  <div key={i} className={`mockup-sidebar-item ${item.active ? "active" : ""}`}>
                    <div className="mockup-avatar" style={{ background: item.color }}>
                      {item.initials}
                    </div>
                    <div className="mockup-sidebar-info">
                      <div className="mockup-sidebar-top">
                        <span className="mockup-sidebar-name">{item.name}</span>
                        <span className="mockup-sidebar-time">{item.time}</span>
                      </div>
                      <div className="mockup-sidebar-msg">{item.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Area */}
            <div className="mockup-conversation-area">
              {/* Header */}
              <div className="mockup-chat-header">
                <div className="mockup-header-title-group">
                  <div className="mockup-header-avatar">
                    PD
                  </div>
                  <div className="mockup-header-text">
                    <div className="mockup-header-name">Product Design Guild</div>
                    <div className="mockup-header-status">
                      <span className="online-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                      <span>Sarah, Alex & you online</span>
                    </div>
                  </div>
                </div>

                <div className="mockup-header-actions">
                  <button
                    type="button"
                    className="mockup-action-btn"
                    onClick={() => setActiveTab("calls")}
                    title="Start Video Call"
                  >
                    <span>📹</span>
                    <span className="hide-on-mobile">Call</span>
                  </button>
                  <button
                    type="button"
                    className="mockup-action-btn"
                    onClick={() => setActiveTab("sheets")}
                    title="Open Smart Sheet"
                  >
                    <span>📊</span>
                    <span className="hide-on-mobile">Sheet</span>
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="mockup-messages-stream">
                {messages.map((m) => (
                  <div key={m.id} className={`mockup-bubble-row ${m.isMe ? "is-me" : "is-other"}`}>
                    {!m.isMe && (
                      <div className="mockup-user-avatar" style={{ background: m.gradient }}>
                        {m.initials}
                      </div>
                    )}
                    <div className={`mockup-bubble ${m.isMe ? "bubble-me" : "bubble-other"}`}>
                      {!m.isMe && <div className="bubble-sender-name">{m.sender}</div>}
                      <div className="bubble-text">{m.text}</div>

                      {m.attachment && (
                        <div className="mockup-attachment-pill" onClick={() => setActiveTab("sheets")}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: 16 }}>📊</span>
                            <div style={{ minWidth: 0 }}>
                              <div className="attachment-filename">{m.attachment.name}</div>
                              <div className="attachment-filesize">{m.attachment.size} • Smart Sheet</div>
                            </div>
                          </div>
                          <span className="attachment-open-badge">Open →</span>
                        </div>
                      )}

                      <div className="bubble-timestamp">
                        <span>{m.time}</span>
                        {m.isMe && <span style={{ color: "#38bdf8" }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="mockup-input-bar">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="mockup-text-input"
                />
                <button type="submit" className="mockup-send-btn">
                  <span>Send</span>
                  <span>⚡</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: HD VIDEO CALL */}
        {activeTab === "calls" && (
          <div className="mockup-video-layout">
            <div className="mockup-video-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="video-live-badge">● LIVE HD</span>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Product Design Guild Sync</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>08:42</span>
            </div>

            <div className="mockup-video-grid">
              <div className="video-tile">
                <div className="video-tile-avatar">👩‍💼</div>
                <div className="video-tile-name">Sarah Jenkins (Host) 🎤</div>
                <div className="video-wave-bars">
                  <span /><span /><span /><span />
                </div>
              </div>

              <div className="video-tile you-tile">
                <div className="video-tile-avatar">🧑‍💻</div>
                <div className="video-tile-name">You (Speaking) 🎤</div>
                <div className="video-wave-bars">
                  <span /><span /><span /><span />
                </div>
              </div>

              <div className="video-tile">
                <div className="video-tile-avatar">👨‍🎨</div>
                <div className="video-tile-name">Alex Rivera</div>
              </div>

              <div className="video-tile">
                <div className="video-tile-avatar">👨‍💻</div>
                <div className="video-tile-name">Rohan Patel</div>
              </div>
            </div>

            <div className="mockup-video-controls">
              <button type="button" className="video-ctrl-btn">🎤 Mute</button>
              <button type="button" className="video-ctrl-btn">📹 Camera</button>
              <button type="button" className="video-ctrl-btn hide-on-mobile">🖥️ Share Screen</button>
              <button type="button" className="video-ctrl-btn btn-danger" onClick={() => setActiveTab("chat")}>📞 Leave</button>
            </div>
          </div>
        )}

        {/* TAB 3: SMART SHEETS (DESKTOP TABLE + ZERO-SCROLL MOBILE CARDS) */}
        {activeTab === "sheets" && (
          <div className="mockup-sheets-layout">
            <div className="mockup-sheets-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>📊 Q3 Product Roadmap & Budget Tracker</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Live Real-Time Collaborative Sheet • Auto-saved</div>
              </div>
              <div className="sheets-user-cursors">
                <span className="cursor-badge cursor-blue">Sarah (Editing B3)</span>
                <span className="cursor-badge cursor-green">You (Editing C4)</span>
              </div>
            </div>

            {/* Desktop Full Table */}
            <div className="mockup-table-container hide-on-mobile">
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Module / Feature</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Sprint Est.</th>
                    <th>Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetItems.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.module}</strong></td>
                      <td><span className="user-tag">{item.owner}</span></td>
                      <td><span className={`status-pill status-${item.statusType}`}>{item.status}</span></td>
                      <td>{item.est}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Zero-Scroll Task Cards (100% Fit, No Horizontal Scrolling) */}
            <div className="mockup-mobile-sheet-cards hide-on-desktop">
              {sheetItems.map((item, idx) => (
                <div key={idx} className="mobile-sheet-card">
                  <div className="mobile-sheet-card-top">
                    <strong className="mobile-sheet-title">{item.module}</strong>
                    <span className={`status-pill status-${item.statusType}`}>{item.status}</span>
                  </div>
                  <div className="mobile-sheet-card-meta">
                    <span className="user-tag">{item.owner}</span>
                    <span className="mobile-meta-item">⏱️ {item.est}</span>
                    <span className="mobile-meta-item">📅 {item.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mockup-sheets-footer">
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Formula: <code>=SUM(D2:D5) = 54 hrs Total Sprint</code></span>
              <button type="button" className="btn-primary-glow" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8 }}>+ Add Task</button>
            </div>
          </div>
        )}

        {/* TAB 4: CALENDAR (RESPONSIVE MEETING CARDS WITH CLEAN STACKING) */}
        {activeTab === "calendar" && (
          <div className="mockup-calendar-layout">
            <div className="mockup-calendar-header">
              <div style={{ fontWeight: 700, fontSize: 14 }}>📅 Team Schedule & Meetings</div>
              <button type="button" className="btn-primary-glow" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8 }}>+ New Meeting</button>
            </div>

            <div className="mockup-agenda-list">
              {[
                { time: "11:00 AM", title: "Product Guild HD Video Review", host: "Sarah Jenkins", active: true, duration: "30 min" },
                { time: "02:30 PM", title: "Architecture & WebSocket Benchmark", host: "Alex Rivera", active: false, duration: "45 min" },
                { time: "04:00 PM", title: "Mobile Capacitor Release QA", host: "Rohan Patel", active: false, duration: "25 min" }
              ].map((meeting, i) => (
                <div key={i} className={`mockup-agenda-card ${meeting.active ? "agenda-active" : ""}`}>
                  <div className="agenda-top-row">
                    <div className="agenda-time-badge">{meeting.time}</div>
                    <span className="agenda-duration-pill">{meeting.duration}</span>
                  </div>

                  <div className="agenda-details">
                    <div className="agenda-title">{meeting.title}</div>
                    <div className="agenda-meta">Hosted by {meeting.host}</div>
                  </div>

                  <button
                    type="button"
                    className="agenda-join-btn"
                    onClick={() => setActiveTab("calls")}
                  >
                    {meeting.active ? "Join HD Call 🚀" : "View Details"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
