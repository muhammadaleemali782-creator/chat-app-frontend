import { useState, useRef } from "react";

export default function ThreeDFeatureShowcase() {
  const containerRef = useRef(null);
  const [rot, setRot] = useState({ x: 12, y: -10 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRot({
      x: 12 - y * 18,
      y: -10 + x * 22,
    });
  };

  const handleMouseLeave = () => {
    setRot({ x: 12, y: -10 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1400,
        width: "100%",
        maxWidth: 580,
        margin: "0 auto",
        padding: "30px 10px",
        userSelect: "none"
      }}
    >
      <div
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(1deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)",
          position: "relative",
          width: "100%",
          minHeight: 400
        }}
      >
        {/* Layer 1: Base Chassis Glass Plate */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 30px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px var(--border-soft)",
            transform: "translateZ(0px)",
            position: "relative"
          }}
        >
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                C
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>Chatox Workspace</div>
                <div style={{ fontSize: 11.5, color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
                  Encrypted & Active
                </div>
              </div>
            </div>
            <span style={{ fontSize: 11.5, background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 10px", borderRadius: 20, border: "1px solid var(--border)", fontWeight: 600 }}>
              3D Matrix
            </span>
          </div>

          {/* Base Chat Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 14px", maxWidth: "80%", fontSize: 13, color: "var(--text)" }}>
              Hey! Did you check out the new 3D spatial interface? ⚡
            </div>
            <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 14, padding: "10px 14px", maxWidth: "80%", alignSelf: "flex-end", fontSize: 13, boxShadow: "0 4px 14px var(--accent-glow)" }}>
              Yes! Everything is ultra fast and zero phone number leaks 🚀
            </div>
          </div>
        </div>

        {/* Layer 2 (3D Floating): HD Video Call Card */}
        <div
          style={{
            position: "absolute",
            top: "-18px",
            right: "-12px",
            background: "rgba(15, 23, 42, 0.92)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 18,
            padding: "14px 18px",
            color: "#ffffff",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            transform: "translateZ(55px)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 4
          }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "2px solid #3b82f6" }}>
              👩‍💻
            </div>
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a" }} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>HD Video Room</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Sarah • 08:34 active</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <span style={{ background: "#2563eb", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🎙️</span>
            <span style={{ background: "#ef4444", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📞</span>
          </div>
        </div>

        {/* Layer 3 (3D Floating): Privacy Shield Badge */}
        <div
          style={{
            position: "absolute",
            bottom: "-15px",
            left: "-10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "12px 18px",
            boxShadow: "0 18px 36px rgba(0,0,0,0.25)",
            transform: "translateZ(75px)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 5
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>0 Phone Number Leaks</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Strict @username routing</div>
          </div>
        </div>

        {/* Layer 4 (3D Floating): Smart Sheet Pill */}
        <div
          style={{
            position: "absolute",
            bottom: "45px",
            right: "-8px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "10px 14px",
            boxShadow: "0 16px 32px rgba(0,0,0,0.2)",
            transform: "translateZ(40px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text)",
            zIndex: 3
          }}
        >
          <span style={{ fontSize: 16 }}>📊</span>
          <span>Live Sprint Sheet: <strong>94% Done</strong></span>
        </div>
      </div>
    </div>
  );
}
