import { useState, useEffect, useCallback } from "react";
import api from "../api";
import LoadingScreen from "./LoadingScreen.jsx";
import SheetView from "./SheetView.jsx";
import ModalPortal from "./ModalPortal.jsx";

export default function SheetsListModal({ conversationId, onClose }) {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
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
      const res = await api.post("/sheets", { name: name.trim(), conversationId });
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
        <div style={styles.header}>
          <span style={styles.headerTitle}>📊 Files / Sheets</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={styles.addBtn} onClick={() => setShowCreate((v) => !v)}>
              + Nayi File
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {showCreate && (
          <form style={styles.createForm} onSubmit={handleCreate}>
            <input
              style={styles.input}
              placeholder="File ka naam (jaise: Daily Update, Attendance)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="primary-btn" style={styles.submitBtn} disabled={creating}>
              {creating ? "Ban rahi hai..." : "Banao"}
            </button>
          </form>
        )}

        <div style={styles.body}>
          {loading && <LoadingScreen small message="" />}
          {!loading && sheets.length === 0 && (
            <div style={styles.empty}>
              Koi file nahi hai abhi. Text-only, halki file hai - unlimited entries/fields daal sakte ho,
              images nahi ja sakti (isse fast rehti hai).
            </div>
          )}
          {!loading &&
            sheets.map((s) => (
              <button key={s._id} style={styles.sheetItem} onClick={() => setOpenSheetId(s._id)}>
                <span style={styles.sheetItemName}>📄 {s.name}</span>
                <span style={styles.sheetItemMeta}>
                  {s.owner === s.owner ? "" : ""}
                  {s.columns?.length || 0} fields
                </span>
              </button>
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
    background: "rgba(6,8,14,0.6)",
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-soft)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  headerTitle: { fontSize: 15.5, fontWeight: 700, fontFamily: "var(--font-display)" },
  addBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 28,
    height: 28,
    borderRadius: "50%",
  },
  createForm: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface-2)",
  },
  input: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 11px",
    color: "var(--text)",
    fontSize: 13.5,
  },
  submitBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 600,
  },
  body: { flex: 1, overflowY: "auto", padding: "10px 20px 20px", display: "flex", flexDirection: "column", gap: 6 },
  empty: { textAlign: "center", color: "var(--text-muted)", fontSize: 12.5, padding: "20px 10px", lineHeight: 1.6 },
  sheetItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 13.5,
    color: "var(--text)",
  },
  sheetItemName: { fontWeight: 600 },
  sheetItemMeta: { fontSize: 11, color: "var(--text-faint)" },
};
