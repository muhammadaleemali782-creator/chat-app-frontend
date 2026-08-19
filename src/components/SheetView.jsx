import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useBackHandler } from "../utils/backHandlerStack";
import LoadingScreen from "./LoadingScreen.jsx";
import SheetHistoryModal from "./SheetHistoryModal.jsx";
import ModalPortal from "./ModalPortal.jsx";

const COLOR_OPTIONS = [
  "#7c6fea", "#d9663b", "#2f9e5b", "#1d6fe0", "#e0453f",
  "#c9a227", "#0891b2", "#a855f7", "#db2777", "#64748b",
];

// Sheet ke andar rows-columns dikhane ke 2 tarike - user apni pasand se switch kar sakta hai
const VIEW_MODES = ["table", "cards"];

export default function SheetView({ sheetId, onClose }) {
  const { user } = useAuth();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("sheetViewMode") || "table");
  const [newColLabel, setNewColLabel] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);
  const [savingCell, setSavingCell] = useState(null);
  const [localColorOverrides, setLocalColorOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`sheetColors:${sheetId}`) || "{}");
    } catch {
      return {};
    }
  });

  useBackHandler(
    "sheet-history",
    showHistory,
    () => {
      setShowHistory(false);
      return true;
    }
  );
  useBackHandler(
    "sheet-view",
    true,
    () => {
      onClose();
      return true;
    }
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sheets/${sheetId}`);
      setSheet(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => {
    load();
  }, [load]);

  const setColumnColor = (colId, color) => {
    const updated = { ...localColorOverrides, [colId]: color };
    setLocalColorOverrides(updated);
    localStorage.setItem(`sheetColors:${sheetId}`, JSON.stringify(updated));
  };

  const colorFor = (col) => localColorOverrides[col.id] || col.color;

  const handleAddColumn = async () => {
    if (!newColLabel.trim()) return;
    try {
      const res = await api.post(`/sheets/${sheetId}/columns`, { label: newColLabel.trim() });
      setSheet((s) => ({ ...s, columns: res.data }));
      setNewColLabel("");
      setShowAddCol(false);
    } catch (err) {
      alert(err.response?.data?.message || "Field add nahi hua");
    }
  };

  const handleAddRow = async () => {
    try {
      const res = await api.post(`/sheets/${sheetId}/rows`, { values: {} });
      setSheet((s) => ({ ...s, rows: [...s.rows, res.data] }));
    } catch (err) {
      alert(err.response?.data?.message || "Row add nahi hui");
    }
  };

  const handleCellChange = async (rowId, colId, value) => {
    setSheet((s) => ({
      ...s,
      rows: s.rows.map((r) => (r._id === rowId ? { ...r, values: { ...r.values, [colId]: value } } : r)),
    }));
  };

  const handleCellBlur = async (rowId, colId, value) => {
    setSavingCell(`${rowId}:${colId}`);
    try {
      await api.put(`/sheets/${sheetId}/rows/${rowId}`, { values: { [colId]: value } });
    } catch (err) {
      // ignore - retry not critical for a lightweight tracker
    } finally {
      setSavingCell(null);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm("Yeh entry delete karni hai? History mein rahegi, list se hat jaayegi.")) return;
    try {
      await api.delete(`/sheets/${sheetId}/rows/${rowId}`);
      setSheet((s) => ({ ...s, rows: s.rows.filter((r) => r._id !== rowId) }));
    } catch (err) {
      alert(err.response?.data?.message || "Delete nahi hui");
    }
  };

  const switchView = (mode) => {
    setViewMode(mode);
    localStorage.setItem("sheetViewMode", mode);
  };

  if (loading) {
    return (
      <ModalPortal>
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <LoadingScreen message="Sheet load ho rahi hai..." />
          </div>
        </div>
      </ModalPortal>
    );
  }
  if (!sheet) return null;

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>📊 {sheet.name}</div>
              <div style={styles.headerSub}>
              {sheet.rows.length} entries · {sheet.isOwner ? "Aap owner ho" : "Shared hai aapke saath"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={styles.iconBtn} title="Time Machine (history)" onClick={() => setShowHistory(true)}>
              🕰️
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.viewSwitch}>
            {VIEW_MODES.map((m) => (
              <button
                key={m}
                style={{ ...styles.viewSwitchBtn, ...(viewMode === m ? styles.viewSwitchBtnActive : {}) }}
                onClick={() => switchView(m)}
              >
                {m === "table" ? "▦ Table" : "▤ Cards"}
              </button>
            ))}
          </div>
          <button style={styles.addFieldBtn} onClick={() => setShowAddCol((v) => !v)}>
            + Field
          </button>
        </div>

        {showAddCol && (
          <div style={styles.addColBox}>
            <input
              style={styles.input}
              placeholder="Field ka naam (jaise: Date, Hours, Kaam kya kiya)"
              value={newColLabel}
              onChange={(e) => setNewColLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            />
            <button style={styles.addColConfirmBtn} onClick={handleAddColumn}>
              Add karo
            </button>
          </div>
        )}

        <div style={styles.body}>
          {viewMode === "table" ? (
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {sheet.columns.map((col) => (
                      <th key={col.id} style={styles.th}>
                        <ColumnColorPicker
                          label={col.label}
                          color={colorFor(col)}
                          onPick={(c) => setColumnColor(col.id, c)}
                        />
                      </th>
                    ))}
                    {sheet.isOwner && <th style={styles.th}></th>}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.map((row) => (
                    <tr key={row._id}>
                      {sheet.columns.map((col) => (
                        <td key={col.id} style={styles.td}>
                          <input
                            style={{
                              ...styles.cellInput,
                              borderBottom: `2px solid ${colorFor(col)}33`,
                            }}
                            value={row.values?.[col.id] || ""}
                            onChange={(e) => handleCellChange(row._id, col.id, e.target.value)}
                            onBlur={(e) => handleCellBlur(row._id, col.id, e.target.value)}
                          />
                          {savingCell === `${row._id}:${col.id}` && (
                            <span style={styles.savingDot} />
                          )}
                        </td>
                      ))}
                      {sheet.isOwner && (
                        <td style={styles.td}>
                          <button style={styles.rowDeleteBtn} onClick={() => handleDeleteRow(row._id)}>
                            🗑
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {sheet.rows.length === 0 && (
                    <tr>
                      <td colSpan={sheet.columns.length + 1} style={styles.emptyCell}>
                        Koi entry nahi hai abhi - "+ Naya Row" pe click karo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.cardsWrap}>
              {sheet.rows.map((row) => (
                <div key={row._id} style={styles.card}>
                  {sheet.columns.map((col) => (
                    <div key={col.id} style={styles.cardField}>
                      <span style={{ ...styles.cardFieldLabel, color: colorFor(col) }}>
                        {col.label}
                      </span>
                      <input
                        style={styles.cardFieldInput}
                        value={row.values?.[col.id] || ""}
                        onChange={(e) => handleCellChange(row._id, col.id, e.target.value)}
                        onBlur={(e) => handleCellBlur(row._id, col.id, e.target.value)}
                      />
                    </div>
                  ))}
                  {sheet.isOwner && (
                    <button style={styles.cardDeleteBtn} onClick={() => handleDeleteRow(row._id)}>
                      🗑 Delete
                    </button>
                  )}
                </div>
              ))}
              {sheet.rows.length === 0 && (
                <div style={styles.emptyCell}>Koi entry nahi hai abhi</div>
              )}
            </div>
          )}
        </div>

        <button style={styles.addRowBtn} onClick={handleAddRow}>
          + Naya Row
        </button>
        </div>{/* closes modal */}

      {showHistory && <SheetHistoryModal sheetId={sheetId} onClose={() => setShowHistory(false)} />}
      </div>{/* closes backdrop */}
    </ModalPortal>
  );
}

function ColumnColorPicker({ label, color, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button style={styles.colHeaderBtn} onClick={() => setOpen((v) => !v)}>
        <span style={{ ...styles.colorDot, background: color }} />
        {label}
      </button>
      {open && (
        <div style={styles.colorPopover}>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              style={{ ...styles.colorSwatch, background: c }}
              onClick={() => {
                onPick(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
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
    padding: 12,
  },
  modal: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "92vh",
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
    alignItems: "flex-start",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  headerTitle: { fontSize: 15.5, fontWeight: 700, fontFamily: "var(--font-display)" },
  headerSub: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 },
  iconBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 14,
  },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 32,
    height: 32,
    borderRadius: "50%",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    gap: 8,
  },
  viewSwitch: { display: "flex", gap: 4, background: "var(--surface-2)", borderRadius: 8, padding: 3 },
  viewSwitchBtn: {
    background: "transparent",
    border: "none",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 11.5,
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  viewSwitchBtnActive: { background: "var(--surface)", color: "var(--accent)" },
  addFieldBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
  addColBox: { display: "flex", gap: 8, padding: "0 20px 10px" },
  input: {
    flex: 1,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 13,
  },
  addColConfirmBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  body: { flex: 1, minHeight: 0, overflow: "auto", padding: "0 20px" },
  tableScroll: { overflowX: "auto", paddingBottom: 10 },
  table: { borderCollapse: "collapse", width: "100%", minWidth: 400 },
  th: {
    textAlign: "left",
    padding: "6px 10px",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  },
  colHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 12.5,
    fontWeight: 700,
  },
  colorDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  colorPopover: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 4,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    boxShadow: "var(--shadow-soft)",
    padding: 8,
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6,
    zIndex: 20,
  },
  colorSwatch: { width: 18, height: 18, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.15)" },
  td: { padding: "4px 8px", borderBottom: "1px solid var(--border-soft)", position: "relative" },
  cellInput: {
    width: "100%",
    minWidth: 100,
    background: "transparent",
    border: "none",
    padding: "8px 4px",
    color: "var(--text)",
    fontSize: 13,
  },
  savingDot: {
    position: "absolute",
    top: 6,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  rowDeleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12,
  },
  emptyCell: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 13,
    padding: "24px 10px",
  },
  cardsWrap: { display: "flex", flexDirection: "column", gap: 10, paddingBottom: 10 },
  card: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardField: { display: "flex", flexDirection: "column", gap: 2 },
  cardFieldLabel: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" },
  cardFieldInput: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "6px 8px",
    color: "var(--text)",
    fontSize: 13,
  },
  cardDeleteBtn: {
    alignSelf: "flex-end",
    background: "transparent",
    border: "none",
    color: "var(--danger)",
    fontSize: 11.5,
  },
  addRowBtn: {
    margin: 16,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13.5,
    fontWeight: 600,
  },
};
