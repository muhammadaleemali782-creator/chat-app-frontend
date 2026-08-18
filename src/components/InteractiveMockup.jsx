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
        <div className="mockup-dots hide-on-mobile">
          <span className="mockup-dot mockup-dot-red" />
          <span className="mockup-dot mockup-dot-yellow" />
          <span className="mockup-dot mockup-dot-green" />
        </div>

        {/* Tab Switcher - Smooth horizontal scroll on mobile */}
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
            <span>📅</span> Calendar
          </button>
        </div>

        <div className="mockup-demo-pill hide-on-mobile" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          <span className="online-dot" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", marginRight: 6 }} />
          Live Interactive Simulator
        </div>
      </div>

      {/* Main Mockup Body */}
      <div className="mockup-content-body">
        {/* Tab 1: Live Chat */}
        {activeTab === "chat" && (
          <div style={{ display: "flex", width: "100%", height: 480 }}>
            {/* Mock Sidebar (Desktop) */}
            <div style={{ width: 250, borderRight: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", flexShrink: 0 }} className="hide-on-mobile">
              <div style={{ padding: "14px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Direct Messages</span>
                <span style={{ fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>4 Online</span>
              </div>
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
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
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: item.active ? 700 : 500 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                        <span style={{ fontSize: 10.5, color: "var(--text-faint)" }}>{item.time}</span>
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
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--surface)", minWidth: 0, width: "100%" }}>
              {/* Chat Header with spacious layout */}
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    🎨
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Product Design Guild
                    </div>
                    <div style={{ fontSize: 11, color: "var(--amber)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block", flexShrink: 0 }} />
                      Sarah, Alex & you online
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("calls")}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 4 }}
                    title="Start HD Video Call"
                  >
                    <span>📹</span>
                    <span className="hide-on-mobile">Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sheets")}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 4 }}
                    title="Open Live Smart Sheet"
                  >
                    <span>📊</span>
                    <span className="hide-on-mobile">Sheet</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: m.isMe ? "row-reverse" : "row",
                      gap: 8,
                      alignItems: "flex-end",
                      maxWidth: "88%",
                      alignSelf: m.isMe ? "flex-end" : "flex-start"
                    }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{m.avatar}</span>
                    <div
                      style={{
                        background: m.isMe ? "var(--accent)" : "var(--surface-2)",
                        color: m.isMe ? "#ffffff" : "var(--text)",
                        padding: "9px 13px",
                        borderRadius: m.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        fontSize: 13,
                        lineHeight: 1.45,
                        boxShadow: m.isMe ? "0 2px 10px var(--accent-glow)" : "none",
                        border: m.isMe ? "none" : "1px solid var(--border)",
                        wordBreak: "break-word"
                      }}
                    >
                      <div style={{ fontSize: 10.5, opacity: 0.8, marginBottom: 2, fontWeight: 700 }}>{m.sender}</div>
                      <div>{m.text}</div>
                      {m.attachment && (
                        <div
                          onClick={() => setActiveTab("sheets")}
                          style={{
                            marginTop: 8,
                            padding: "7px 10px",
                            background: "rgba(0,0,0,0.08)",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            cursor: "pointer",
                            fontSize: 11.5,
                            fontWeight: 600
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📊 {m.attachment.name}</span>
                          <span style={{ flexShrink: 0, fontSize: 10.5, background: "var(--accent)", color: "#fff", padding: "2px 7px", borderRadius: 4 }}>Open →</span>
                        </div>
                      )}
                      <div style={{ fontSize: 9.5, opacity: 0.7, textAlign: "right", marginTop: 3 }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, background: "var(--surface-2)" }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    color: "var(--text)",
                    fontSize: 13
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "0 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: HD Video Call */}
        {activeTab === "calls" && (
          <div style={{ width: "100%", height: 480, background: "#0b0e14", padding: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
            {/* Call Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulseDot 1.5s infinite" }} />
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>Design Review Call</span>
                </div>
                <span style={{ background: "rgba(255,255,255,0.12)", padding: "2px 7px", borderRadius: 6, fontSize: 11, color: "#cbd5e1" }}>12:45</span>
              </div>
              <span style={{ fontSize: 11, background: "rgba(16,185,129,0.18)", color: "#34d399", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>
                🔒 E2E Encrypted
              </span>
            </div>

            {/* Video Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
              <div style={{ background: "#1a202c", borderRadius: 14, border: "2px solid var(--accent)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 40 }}>👩‍💼</div>
                <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(0,0,0,0.7)", padding: "3px 6px", borderRadius: 6, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sarah J.</span>
                  <span style={{ color: "#34d399", fontSize: 10.5 }}>🎤</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 40 }}>🧑‍💻</div>
                <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(0,0,0,0.7)", padding: "3px 6px", borderRadius: 6, fontSize: 10.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span>You (Host)</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 40 }}>👨‍🎨</div>
                <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(0,0,0,0.7)", padding: "3px 6px", borderRadius: 6, fontSize: 10.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span>Alex R.</span>
                </div>
              </div>

              <div style={{ background: "#1a202c", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 40 }}>👨‍💻</div>
                <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(0,0,0,0.7)", padding: "3px 6px", borderRadius: 6, fontSize: 10.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span>Rohan P.</span>
                </div>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
              <button type="button" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 15 }}>🎤</button>
              <button type="button" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 15 }}>📹</button>
              <button type="button" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 15 }}>🖥️</button>
              <button type="button" onClick={() => setActiveTab("chat")} style={{ width: 38, height: 38, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 15 }}>📞</button>
            </div>
          </div>
        )}

        {/* Tab 3: Smart Sheets */}
        {activeTab === "sheets" && (
          <div style={{ width: "100%", height: 480, display: "flex", flexDirection: "column", background: "var(--surface)" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Q3 Product Launch Budget.sheet</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Live collaboration with 3 editors</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#0284c7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>SJ</span>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>AR</span>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>YOU</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--surface-hover)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-muted)" }}>#</th>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Feature Module</th>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Owner</th>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>ETA</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Impact</th>
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
                      <td style={{ padding: "8px 10px", color: "var(--text-faint)" }}>{row.id}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{row.mod}</td>
                      <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{row.owner}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ background: "var(--surface-2)", color: row.color, padding: "2px 7px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, border: "1px solid var(--border)" }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{row.eta}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{row.impact}</td>
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
            <div style={{ width: 250, borderRight: "1px solid var(--border)", padding: 14, background: "var(--surface-2)", flexShrink: 0 }} className="hide-on-mobile">
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>August 2026</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, textAlign: "center", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 6 }}>
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, textAlign: "center", fontSize: 11 }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <span
                    key={day}
                    style={{
                      padding: "4px 0",
                      borderRadius: 6,
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

            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>Scheduled Calls</span>
                <button type="button" className="btn-primary-glow" style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11.5 }}>
                  + Schedule Call
                </button>
              </div>

              {[
                { title: "🚀 Q3 Roadmap & Product Demo", time: "11:00 AM - 11:45 AM", host: "Sarah Jenkins" },
                { title: "🎨 UI/UX Architecture Review", time: "02:30 PM - 03:15 PM", host: "Alex Rivera" },
                { title: "🔒 Security & App Lock Audit", time: "04:30 PM - 05:00 PM", host: "Rohan Patel" }
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Join Room →
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
