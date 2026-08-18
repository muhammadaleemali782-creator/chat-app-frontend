import { useState } from "react";

export default function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah", text: "Hey team! Is the new Chatox release ready? 🚀", time: "10:42 AM", isMe: false, avatar: "👩‍💼" },
    { id: 2, sender: "You", text: "Yes! 100% private, no phone numbers needed. Real-time WebSockets are blazing fast ⚡", time: "10:43 AM", isMe: true, avatar: "🧑‍💻" },
    { id: 3, sender: "Alex", text: "Check out the sprint sheet I attached inside our group:", time: "10:44 AM", isMe: false, avatar: "👨‍🎨", attachment: { type: "sheet", name: "Q3_Roadmap_V2.sheet" } },
    { id: 4, sender: "You", text: "Awesome, let's jump on a quick HD call at 11 AM!", time: "10:45 AM", isMe: true, avatar: "🧑‍💻" }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: chatInput,
      time: "Just now",
      isMe: true,
      avatar: "🧑‍💻"
    };
    setMessages([...messages, newMsg]);
    setChatInput("");
  };

  return (
    <div className="mockup-shell">
      {/* Chrome Top Bar */}
      <div className="mockup-header-bar">
        <div className="mockup-dots">
          <span className="mockup-dot mockup-dot-red" />
          <span className="mockup-dot mockup-dot-yellow" />
          <span className="mockup-dot mockup-dot-green" />
        </div>

        {/* Tab Switcher */}
        <div className="mockup-nav-tabs">
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <span>💬</span> Live Chat
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "calls" ? "active" : ""}`}
            onClick={() => setActiveTab("calls")}
          >
            <span>📹</span> HD Video Call
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "sheets" ? "active" : ""}`}
            onClick={() => setActiveTab("sheets")}
          >
            <span>📊</span> Smart Sheets
          </button>
          <button
            type="button"
            className={`mockup-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <span>📅</span> Calendar & Meetings
          </button>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          <span className="online-dot" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", marginRight: 6 }} />
          Live Interactive Demo
        </div>
      </div>

      {/* Main Mockup Body */}
      <div className="mockup-content-body">
        {/* Tab 1: Live Chat */}
        {activeTab === "chat" && (
          <div style={{ display: "flex", width: "100%", height: 480 }}>
            {/* Mock Sidebar */}
            <div style={{ width: 260, borderRight: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column" }} className="hide-on-mobile">
              <div style={{ padding: "16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Direct Messages</span>
                <span style={{ fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>4 Online</span>
              </div>
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { name: "Product Design Guild", msg: "Alex: Sheet uploaded", time: "10:44 AM", active: true, unread: 2, icon: "🎨" },
                  { name: "Sarah Jenkins", msg: "Voice note received", time: "10:15 AM", active: false, unread: 0, icon: "👩‍💼" },
                  { name: "Dev Core Team", msg: "Meeting scheduled for 3pm", time: "Yesterday", active: false, unread: 0, icon: "⚡" },
                  { name: "Rohan Patel", msg: "Hey, are you free?", time: "2d ago", active: false, unread: 0, icon: "👨‍💻" }
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: item.active ? "var(--surface)" : "transparent",
                      border: item.active ? "1px solid var(--border)" : "1px solid transparent",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: item.active ? 700 : 500 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.msg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Chat Conversation */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--surface)" }}>
              {/* Chat Header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                    🎨
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Product Design Guild</div>
                    <div style={{ fontSize: 12, color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
                      Sarah, Alex, Rohan & you are online
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setActiveTab("calls")} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    📹 Start Call
                  </button>
                  <button type="button" onClick={() => setActiveTab("sheets")} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    📊 Open Sheet
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, background: "var(--bg)" }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: m.isMe ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      gap: 10
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      {m.avatar}
                    </div>
                    <div style={{ maxWidth: "70%" }}>
                      <div
                        style={{
                          padding: "10px 16px",
                          borderRadius: 16,
                          borderBottomRightRadius: m.isMe ? 4 : 16,
                          borderBottomLeftRadius: !m.isMe ? 4 : 16,
                          background: m.isMe ? "var(--accent)" : "var(--surface)",
                          color: m.isMe ? "#ffffff" : "var(--text)",
                          border: m.isMe ? "none" : "1px solid var(--border)",
                          boxShadow: "var(--shadow-bubble)",
                          fontSize: 14,
                          lineHeight: 1.45
                        }}
                      >
                        <div>{m.text}</div>
                        {m.attachment && (
                          <div
                            onClick={() => setActiveTab("sheets")}
                            style={{
                              marginTop: 8,
                              padding: "8px 12px",
                              borderRadius: 8,
                              background: "rgba(0,0,0,0.05)",
                              border: "1px solid rgba(0,0,0,0.08)",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer"
                            }}
                          >
                            <span style={{ fontSize: 18 }}>📊</span>
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{m.attachment.name}</span>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent)" }}>View Live →</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 4, textAlign: m.isMe ? "right" : "left", display: "flex", alignItems: "center", justifyContent: m.isMe ? "flex-end" : "flex-start", gap: 4 }}>
                        <span>{m.time}</span>
                        {m.isMe && <span style={{ color: "var(--amber)", fontSize: 12 }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Type an interactive message to test..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 13.5
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary-glow"
                  style={{ padding: "10px 18px", borderRadius: 12, fontSize: 13.5 }}
                >
                  Send ⚡
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: HD Video Call */}
        {activeTab === "calls" && (
          <div style={{ width: "100%", height: 480, background: "#0b0e14", padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "pulseDot 1.5s infinite" }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Design Review & Sprint Planning</span>
                <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>12:45</span>
              </div>
              <span style={{ fontSize: 12, background: "rgba(16,185,129,0.2)", color: "#34d399", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>
                🔒 E2E Encrypted WebRTC
              </span>
            </div>

            {/* Video Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
              <div style={{ background: "#1a202c", borderRadius: 16, border: "2px solid var(--accent)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 54 }}>👩‍💼</div>
                <div style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Sarah Jenkins (Speaking)</span>
                  <span style={{ color: "#34d399" }}>🎤</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 54 }}>🧑‍💻</div>
                <div style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>
                  <span>You</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 54 }}>👨‍🎨</div>
                <div style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>
                  <span>Alex Rivera</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 54 }}>👨‍💻</div>
                <div style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>
                  <span>Rohan Patel</span>
                </div>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 14 }}>
              <button type="button" style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 18 }}>🎤</button>
              <button type="button" style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 18 }}>📹</button>
              <button type="button" style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 18 }}>🖥️</button>
              <button type="button" style={{ width: 44, height: 44, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 18 }}>📞</button>
            </div>
          </div>
        )}

        {/* Tab 3: Smart Sheets */}
        {activeTab === "sheets" && (
          <div style={{ width: "100%", height: 480, display: "flex", flexDirection: "column", background: "var(--surface)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>📊</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Q3 Product Launch Budget & Deliverables.sheet</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Live collaboration with 3 editors</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#0284c7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>SJ</span>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>AR</span>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>YOU</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: 16, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-hover)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)" }}>#</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Feature Module</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Owner</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>ETA</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, mod: "Zero Phone Auth & Username Gate", owner: "Sarah J.", status: "Completed", eta: "Live", impact: "High", color: "var(--amber)" },
                    { id: 2, mod: "WebRTC Audio/Video Call Room", owner: "Alex R.", status: "Completed", eta: "Live", impact: "Critical", color: "var(--amber)" },
                    { id: 3, mod: "Live Smart Spreadsheet Engine", owner: "You", status: "In Progress", eta: "Today", impact: "High", color: "var(--accent)" },
                    { id: 4, mod: "Calendar & Meeting Scheduler", owner: "Rohan P.", status: "Review", eta: "Tomorrow", impact: "Medium", color: "#f59e0b" },
                    { id: 5, mod: "Capacitor Mobile Push Sync", owner: "Sarah J.", status: "Testing", eta: "Friday", impact: "High", color: "#0284c7" },
                  ].map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 14px", color: "var(--text-faint)" }}>{row.id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{row.mod}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{row.owner}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "var(--surface-2)", color: row.color, padding: "3px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: "1px solid var(--border)" }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{row.eta}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Calendar & Meetings */}
        {activeTab === "calendar" && (
          <div style={{ width: "100%", height: 480, display: "flex", background: "var(--surface)" }}>
            <div style={{ width: 280, borderRight: "1px solid var(--border)", padding: 18, background: "var(--surface-2)" }} className="hide-on-mobile">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>August 2026</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center", fontSize: 12 }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <span
                    key={day}
                    style={{
                      padding: "6px 0",
                      borderRadius: 8,
                      background: day === 18 ? "var(--accent)" : "transparent",
                      color: day === 18 ? "#fff" : "var(--text)",
                      fontWeight: day === 18 ? 700 : 500
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>Scheduled Meetings & Calls</span>
                <button type="button" className="btn-primary-glow" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12.5 }}>
                  + Schedule Call
                </button>
              </div>

              {[
                { title: "🚀 Q3 Roadmap & Product Demo", time: "11:00 AM - 11:45 AM", host: "Sarah Jenkins", room: "chatox.live/room-q3-demo", tags: ["Strategy", "Team Sync"] },
                { title: "🎨 UI/UX Pro Max Architecture Review", time: "02:30 PM - 03:15 PM", host: "Alex Rivera", room: "chatox.live/room-ui-ux", tags: ["Design", "Frontend"] },
                { title: "🔒 Security & App Lock Audit", time: "04:30 PM - 05:00 PM", host: "Rohan Patel", room: "chatox.live/room-security", tags: ["Security"] }
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", gap: 14 }}>
                      <span>🕒 {m.time}</span>
                      <span>👤 {m.host}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("calls")}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Join Room 📹
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
