import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { avatarColor } from "../utils/avatarColor";

export default function ChatDetailsPanel({ conversation, messages, onClose, onOpenFiles }) {
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState("files"); // "starred" | "media" | "files" | "info"

  const isGroup = conversation?.type === "group";
  const other = isGroup
    ? null
    : conversation?.participants?.find((p) => (p._id || p) !== user.id) || conversation?.participants?.[0];

  const title = isGroup ? conversation.name : other?.displayName || "User";
  const subtitle = isGroup
    ? `${conversation.participants?.length || 0} members`
    : `@${other?.username || "user"} · Active`;
  const color = avatarColor(title);

  // Extract shared images/audio from messages
  const mediaItems = useMemo(() => {
    return (messages || []).filter((m) => m.type === "image" && m.mediaData);
  }, [messages]);

  // Extract shared docs/sheets/files from messages
  const docItems = useMemo(() => {
    const fromMsgs = (messages || [])
      .filter((m) => m.type === "file" || (m.text && m.text.includes("📊")))
      .map((m) => ({
        id: m._id,
        name: m.fileName || m.text.slice(0, 30),
        size: m.fileSize || "1.2 MB",
        type: m.text.includes("📊") ? "sheet" : "doc",
      }));

    if (fromMsgs.length === 0) {
      return [
        { id: "d1", name: "Project_Requirements.pdf", size: "2.4 MB", type: "pdf" },
        { id: "d2", name: "Design_Mockups_v2.zip", size: "14.8 MB", type: "zip" },
        { id: "d3", name: "Client_Feedback_Notes.docx", size: "540 KB", type: "doc" },
        { id: "d4", name: "Budget_Expense_Tracker.csv", size: "45 KB", type: "csv" },
      ];
    }
    return fromMsgs;
  }, [messages]);

  const toggleSection = (sec) => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  const getDocIcon = (type) => {
    switch (type) {
      case "pdf":
        return { icon: "📄", bg: "#FEE2E2", color: "#EF4444", label: "PDF" };
      case "doc":
      case "docx":
        return { icon: "📝", bg: "#DBEAFE", color: "#2563EB", label: "DOC" };
      case "zip":
        return { icon: "📦", bg: "#FEF3C7", color: "#D97706", label: "ZIP" };
      case "csv":
      case "sheet":
        return { icon: "📊", bg: "#D1FAE5", color: "#059669", label: "CSV" };
      default:
        return { icon: "📁", bg: "#F3E8FF", color: "#9333EA", label: "FILE" };
    }
  };

  return (
    <div style={styles.panel} className="chat-details-panel">
      {/* Top close button */}
      <div style={styles.topBar}>
        <span style={styles.topBarTitle}>Details</span>
        {onClose && (
          <button style={styles.closeBtn} onClick={onClose} title="Close details">
            ✕
          </button>
        )}
      </div>

      {/* User Profile Card */}
      <div style={styles.profileSection}>
        <div style={{ ...styles.avatarLarge, background: color.bg, color: color.fg }}>
          {title.charAt(0).toUpperCase()}
          <span style={styles.onlineBadge} />
        </div>
        <div style={styles.profileName}>{title}</div>
        <div style={styles.profileRole}>{subtitle}</div>
      </div>

      {/* Accordion Sections */}
      <div style={styles.accordionWrap}>
        {/* 1. Starred Messages */}
        <div style={styles.accordionCard}>
          <button
            type="button"
            style={{ ...styles.accordionHeader, background: "#FFFBEB" }}
            onClick={() => toggleSection("starred")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#92400E" }}>
                Starred Messages
              </span>
            </div>
            <span style={styles.arrowIcon}>{openSection === "starred" ? "▲" : "▼"}</span>
          </button>

          {openSection === "starred" && (
            <div style={styles.accordionContent}>
              <div style={styles.emptyNote}>Koi starred message nahi hai</div>
            </div>
          )}
        </div>

        {/* 2. Media Section */}
        <div style={styles.accordionCard}>
          <button
            type="button"
            style={{ ...styles.accordionHeader, background: "#FDF2F8" }}
            onClick={() => toggleSection("media")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🖼️</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#9D174D" }}>
                Media ({mediaItems.length})
              </span>
            </div>
            <span style={styles.arrowIcon}>{openSection === "media" ? "▲" : "▼"}</span>
          </button>

          {openSection === "media" && (
            <div style={styles.accordionContent}>
              {mediaItems.length === 0 ? (
                <div style={styles.emptyNote}>Koi shared media nahi hai</div>
              ) : (
                <div style={styles.mediaGrid}>
                  {mediaItems.map((m) => (
                    <img
                      key={m._id}
                      src={m.mediaData}
                      alt="shared"
                      style={styles.mediaThumb}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Files & Docs Section */}
        <div style={styles.accordionCard}>
          <button
            type="button"
            style={{ ...styles.accordionHeader, background: "#EFF6FF" }}
            onClick={() => toggleSection("files")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>📁</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#1E40AF" }}>
                Files & Docs ({docItems.length})
              </span>
            </div>
            <span style={styles.arrowIcon}>{openSection === "files" ? "▲" : "▼"}</span>
          </button>

          {openSection === "files" && (
            <div style={styles.accordionContent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docItems.map((doc) => {
                  const iconInfo = getDocIcon(doc.type);
                  return (
                    <div key={doc.id} style={styles.docRow}>
                      <div
                        style={{
                          ...styles.docIconBox,
                          background: iconInfo.bg,
                          color: iconInfo.color,
                        }}
                      >
                        {iconInfo.label}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.docName} title={doc.name}>
                          {doc.name}
                        </div>
                        <div style={styles.docSize}>{doc.size}</div>
                      </div>
                      <button
                        type="button"
                        style={styles.docDownloadBtn}
                        onClick={onOpenFiles}
                        title="Download / Open"
                      >
                        ⬇
                      </button>
                    </div>
                  );
                })}
              </div>

              {onOpenFiles && (
                <button type="button" style={styles.openSheetsBtn} onClick={onOpenFiles}>
                  📊 Open Excel / Sheets Manager ↗
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Information Section */}
        <div style={styles.accordionCard}>
          <button
            type="button"
            style={{ ...styles.accordionHeader, background: "#F8FAFC" }}
            onClick={() => toggleSection("info")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>ℹ️</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#334155" }}>
                Information
              </span>
            </div>
            <span style={styles.arrowIcon}>{openSection === "info" ? "▲" : "▼"}</span>
          </button>

          {openSection === "info" && (
            <div style={styles.accordionContent}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Encryption</span>
                <span style={styles.infoVal}>End-to-End</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Cloud Backup</span>
                <span style={styles.infoVal}>Active</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Real-time Sync</span>
                <span style={{ ...styles.infoVal, color: "#10B981" }}>Connected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: 290,
    minWidth: 270,
    maxWidth: 320,
    height: "100%",
    background: "#FFFFFF",
    borderLeft: "1px solid #F1F5F9",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    padding: "20px 16px",
    boxSizing: "border-box",
    flexShrink: 0,
    borderRadius: "0 28px 28px 0",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0F172A",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  closeBtn: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    width: 28,
    height: 28,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "16px 8px 20px",
    borderBottom: "1px solid #F1F5F9",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 900,
    position: "relative",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.2)",
    border: "3px solid #ffffff",
    marginBottom: 12,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#10B981",
    border: "2.5px solid #ffffff",
  },
  profileName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0F172A",
    fontFamily: "var(--font-display)",
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: 500,
  },
  accordionWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  accordionCard: {
    borderRadius: 16,
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    background: "#FFFFFF",
  },
  accordionHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  arrowIcon: {
    fontSize: 10,
    color: "#64748B",
  },
  accordionContent: {
    padding: "12px 14px",
    background: "#FFFFFF",
    borderTop: "1px solid #F1F5F9",
  },
  emptyNote: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    padding: "8px 0",
  },
  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
  },
  mediaThumb: {
    width: "100%",
    height: 64,
    borderRadius: 10,
    objectFit: "cover",
  },
  docRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  docIconBox: {
    fontSize: 9,
    fontWeight: 900,
    padding: "4px 6px",
    borderRadius: 6,
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  docName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0F172A",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  docSize: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1,
  },
  docDownloadBtn: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    borderRadius: 6,
    width: 26,
    height: 26,
    cursor: "pointer",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  openSheetsBtn: {
    marginTop: 10,
    width: "100%",
    background: "rgba(79, 70, 229, 0.08)",
    color: "#4F46E5",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "center",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    padding: "4px 0",
  },
  infoLabel: {
    color: "#64748B",
  },
  infoVal: {
    fontWeight: 600,
    color: "#0F172A",
  },
};
