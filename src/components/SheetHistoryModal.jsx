import { useState, useEffect } from "react";
import api from "../api";
import LoadingScreen from "./LoadingScreen.jsx";

const ACTION_LABEL = {
  add: { icon: "➕", text: "Add hui" },
  edit: { icon: "✏️", text: "Edit hui" },
  delete: { icon: "🗑", text: "Delete hui" },
};

function formatDT(d) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderValues(obj) {
  if (!obj) return "(khaali)";
  const entries = Object.entries(obj);
  if (entries.length === 0) return "(khaali)";
  return entries.map(([k, v]) => `${k}: ${v || "-"}`).join(" · ");
}

export default function SheetHistoryModal({ sheetId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/sheets/${sheetId}/history`);
        setHistory(res.data);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [sheetId]);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>🕰️ Time Machine</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.sub}>
          Yahan har add/edit/delete ka poora record hai - kabhi kuch permanently gayab nahi hota.
        </div>

        <div style={styles.body}>
          {loading && <LoadingScreen small message="" />}
          {!loading && history.length === 0 && (
            <div style={styles.empty}>Abhi tak koi history nahi hai.</div>
          )}
          {!loading &&
            history.map((h, i) => {
              const meta = ACTION_LABEL[h.action] || { icon: "•", text: h.action };
              return (
                <div key={i} style={styles.item}>
                  <div style={styles.itemHead}>
                    <span>
                      {meta.icon} {meta.text}
                    </span>
                    <span style={styles.itemBy}>
                      {h.byUser?.displayName || "Kisi ne"} · {formatDT(h.at)}
                    </span>
                  </div>
                  {h.action === "edit" && (
                    <div style={styles.itemDiff}>
                      <div style={styles.itemBefore}>Pehle: {renderValues(h.before)}</div>
                      <div style={styles.itemAfter}>Ab: {renderValues(h.after)}</div>
                    </div>
                  )}
                  {h.action === "delete" && (
                    <div style={styles.itemDiff}>
                      <div style={styles.itemBefore}>Delete hua data: {renderValues(h.before)}</div>
                    </div>
                  )}
                  {h.action === "add" && (
                    <div style={styles.itemDiff}>
                      <div style={styles.itemAfter}>{renderValues(h.after)}</div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,8,14,0.6)",
    zIndex: 520,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
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
    padding: "16px 20px 6px",
  },
  headerTitle: { fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 28,
    height: 28,
    borderRadius: "50%",
  },
  sub: { fontSize: 11.5, color: "var(--text-muted)", padding: "0 20px 12px", lineHeight: 1.5 },
  body: { flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 8 },
  empty: { textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" },
  item: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  itemHead: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12.5,
    fontWeight: 600,
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 4,
  },
  itemBy: { color: "var(--text-faint)", fontWeight: 400, fontSize: 11 },
  itemDiff: { fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 },
  itemBefore: { color: "var(--danger)", opacity: 0.85 },
  itemAfter: { color: "var(--amber)" },
};
