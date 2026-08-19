import { useState, useEffect, useCallback } from "react";
import api from "../api";
import LoadingScreen from "./LoadingScreen.jsx";
import SheetView from "./SheetView.jsx";
import ModalPortal from "./ModalPortal.jsx";

const TEMPLATES = [
  {
    id: "tasks",
    icon: "📋",
    title: "Task & Work Log",
    desc: "Kaam, kisko diya, status, deadline",
  },
  {
    id: "attendance",
    icon: "👥",
    title: "Attendance & Members",
    desc: "Member ka naam, tarikh, present/absent, ghante",
  },
  {
    id: "expense",
    icon: "💰",
    title: "Expense / Budget",
    desc: "Kharche ka naam, category, amount, kisne pay kiya",
  },
  {
    id: "blank",
    icon: "📊",
    title: "Custom / Blank Sheet",
    desc: "Apne hisaab se custom columns banao",
  },
];

export default function SheetsListModal({ conversationId, onClose }) {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("tasks");
  const [creating, setCreating] = useState(false);
  const [openSheetId, setOpenSheetId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/sheets", { params: { conversationId } });
      setSheets(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/sheets", {
        name: name.trim(),
        conversationId,
        template: selectedTemplate,
      });
      setName("");
      setShowCreate(false);
      setSheets((prev) => [res.data, ...prev]);
      setOpenSheetId(res.data._id);
    } catch (err) {
      alert(err.response?.data?.message || "Sheet nahi ban payi");
    } finally {
      setCreating(false);
    }
  };

  if (openSheetId) {
    return <SheetView sheetId={openSheetId} onClose={() => { setOpenSheetId(null); load(); }} />;
  }

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span style={styles.headerTitle}>Excel Files & Sheets</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={styles.addBtn} onClick={() => setShowCreate((v) => !v)}>
                {showCreate ? "Cancel" : "+ Nayi File Banao"}
              </button>
              <button style={styles.closeBtn} onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {/* Create Form with Templates */}
          {showCreate && (
            <form style={styles.createForm} onSubmit={handleCreate}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                1. File ka naam likho:
              </div>
              <input
                style={styles.input}
                placeholder="Jaise: Project Tasks, Daily Attendance, May Budget"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />

              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginTop: 6 }}>
                2. Ek Template choose karo:
              </div>
              <div style={styles.templateGrid}>
                {TEMPLATES.map((t) => {
                  const isSel = selectedTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      style={{
                        ...styles.templateCard,
                        ...(isSel ? styles.templateCardActive : {}),
                      }}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: isSel ? "var(--accent)" : "var(--text)" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {t.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button className="primary-btn" style={styles.submitBtn} disabled={creating}>
                {creating ? "Excel file ban rahi hai..." : "Excel Sheet Banao ✓"}
              </button>
            </form>
          )}

          {/* Files List */}
          <div style={styles.body}>
            {loading && <LoadingScreen small message="Files load ho rahi hain..." />}
            {!loading && sheets.length === 0 && !showCreate && (
              <div style={styles.empty}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                  Koi file nahi hai abhi
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4, maxWidth: 300, margin: "4px auto 14px" }}>
                  Unlimited lightweight Excel sheets banao — tasks, attendance, kharche aur lists track karne ke liye.
                </div>
                <button style={styles.createNowBtn} onClick={() => setShowCreate(true)}>
                  + Pehli File Banao
                </button>
              </div>
            )}
            {!loading &&
              sheets.map((s) => (
                <div
                  key={s._id}
                  style={styles.sheetItem}
                  onClick={() => setOpenSheetId(s._id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={styles.sheetIconBox}>📊</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.sheetItemName}>{s.name}</div>
                      <div style={styles.sheetItemMeta}>
                        {s.columns?.length || 0} fields · Auto-sync cloud
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={styles.openBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSheetId(s._id);
                    }}
                  >
                    Open ↗
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "88vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border, #e2e8f0)",
    background: "var(--surface-2, #f8fafc)",
  },
  headerTitle: { fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)" },
  addBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  closeBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
  },
  createForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    maxHeight: "65vh",
    overflowY: "auto",
  },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 13.5,
    boxSizing: "border-box",
  },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
  },
  templateCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--surface-2)",
    border: "1.5px solid var(--border)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  templateCardActive: {
    background: "var(--accent-soft)",
    borderColor: "var(--accent)",
    boxShadow: "0 2px 10px var(--accent-glow)",
  },
  submitBtn: {
    marginTop: 4,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 16px",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 3px 12px var(--accent-glow)",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: {
    textAlign: "center",
    padding: "24px 16px",
  },
  createNowBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  sheetItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  sheetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#10B981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
  },
  sheetItemName: {
    fontWeight: 700,
    fontSize: 14,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sheetItemMeta: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    marginTop: 2,
  },
  openBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--accent)",
    cursor: "pointer",
    flexShrink: 0,
  },
};
