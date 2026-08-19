import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useBackHandler } from "../utils/backHandlerStack";
import LoadingScreen from "./LoadingScreen.jsx";
import SheetHistoryModal from "./SheetHistoryModal.jsx";
import ModalPortal from "./ModalPortal.jsx";

const DEFAULT_COLS = [
  { id: "col_a", label: "Title / Task", color: "#4F46E5" },
  { id: "col_b", label: "Assignee / Name", color: "#06B6D4" },
  { id: "col_c", label: "Status", color: "#10B981" },
  { id: "col_d", label: "Notes / Details", color: "#F59E0B" },
];

// Helper: Export Sheet data to Excel-compatible CSV
function exportSheetCSV(sheet) {
  if (!sheet || !sheet.columns) return;
  const cols = sheet.columns;
  const header = cols.map((c) => `"${(c.label || "").replace(/"/g, '""')}"`).join(",");
  const rows = (sheet.rows || []).map((row) =>
    cols
      .map((col) => {
        const val = row.values?.[col.id] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(sheet.name || "sheet").replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SheetView({ sheetId, onClose }) {
  const { user } = useAuth();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [newColLabel, setNewColLabel] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);
  const [savingCell, setSavingCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState("");

  useBackHandler("sheet-history", showHistory, () => {
    setShowHistory(false);
    return true;
  });

  useBackHandler("sheet-view", true, () => {
    onClose();
    return true;
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get(`/sheets/${sheetId}`);
      let s = res.data;
      // If columns are empty or single default, ensure clean columns
      if (!s.columns || s.columns.length === 0) {
        s.columns = DEFAULT_COLS;
      }
      setSheet(s);
    } catch (err) {
      console.error("Sheet load error:", err);
      setLoadError(err.response?.data?.message || "Sheet open nahi ho paayi");
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddColumn = async () => {
    if (!newColLabel.trim()) return;
    try {
      const res = await api.post(`/sheets/${sheetId}/columns`, { label: newColLabel.trim() });
      setSheet((s) => ({ ...s, columns: res.data }));
      setNewColLabel("");
      setShowAddCol(false);
    } catch (err) {
      alert(err.response?.data?.message || "Column add nahi hua");
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

  const handleCellChange = (rowId, colId, value) => {
    setSheet((s) => ({
      ...s,
      rows: s.rows.map((r) =>
        r._id === rowId ? { ...r, values: { ...(r.values || {}), [colId]: value } } : r
      ),
    }));
  };

  const handleCellBlur = async (rowId, colId, value) => {
    setSavingCell(`${rowId}:${colId}`);
    try {
      await api.put(`/sheets/${sheetId}/rows/${rowId}`, { values: { [colId]: value } });
    } catch (err) {
      // ignore
    } finally {
      setSavingCell(null);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm("Yeh row delete karni hai?")) return;
    try {
      await api.delete(`/sheets/${sheetId}/rows/${rowId}`);
      setSheet((s) => ({ ...s, rows: s.rows.filter((r) => r._id !== rowId) }));
    } catch (err) {
      alert(err.response?.data?.message || "Delete nahi hui");
    }
  };

  const filteredRows = useMemo(() => {
    if (!sheet?.rows) return [];
    if (!searchQuery.trim()) return sheet.rows;
    const q = searchQuery.toLowerCase();
    return sheet.rows.filter((r) =>
      Object.values(r.values || {}).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sheet?.rows, searchQuery]);

  if (loading) {
    return (
      <ModalPortal>
        <div style={styles.backdrop} onClick={onClose}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <LoadingScreen message="Excel Sheet load ho rahi hai..." />
          </div>
        </div>
      </ModalPortal>
    );
  }

  if (loadError || !sheet) {
    return (
      <ModalPortal>
        <div style={styles.backdrop} onClick={onClose}>
          <div style={{ ...styles.modal, padding: 28, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "var(--text)" }}>
              Sheet Load Nahi Hui
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 18px" }}>
              {loadError || "Sheet ka access nahi mila ya server pe issue hai."}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={styles.actionBtnPrimary} onClick={load}>Dobara Try Karo 🔄</button>
              <button style={styles.actionBtnSecondary} onClick={onClose}>Band Karo</button>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* ── TOP RIBBON ── */}
          <div style={styles.ribbon}>
            <div style={styles.ribbonLeft}>
              <div style={styles.excelIcon}>📊</div>
              <div>
                <div style={styles.sheetTitle}>{sheet.name}</div>
                <div style={styles.sheetMeta}>
                  {sheet.rows.length} rows · {sheet.columns.length} columns · {sheet.isOwner ? "👑 Owner" : "Shared"}
                </div>
              </div>
            </div>

            <div style={styles.ribbonRight}>
              <button
                style={styles.exportBtn}
                onClick={() => exportSheetCSV(sheet)}
                title="Download Excel / CSV File"
              >
                <span>⬇</span>
                <span>Download (.csv)</span>
              </button>
              <button
                style={styles.iconBtn}
                title="Time Machine (history)"
                onClick={() => setShowHistory(true)}
              >
                🕰️
              </button>
              <button style={styles.closeBtn} onClick={onClose} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* ── ACTION TOOLBAR ── */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <span style={{ fontSize: 13, opacity: 0.7 }}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Sheet mein data dhoondo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button style={styles.clearSearch} onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={styles.addColBtn} onClick={() => setShowAddCol((v) => !v)}>
                + Add Column
              </button>
              <button style={styles.addRowTopBtn} onClick={handleAddRow}>
                + Add Row
              </button>
            </div>
          </div>

          {/* ── ADD COLUMN INLINE FORM ── */}
          {showAddCol && (
            <div style={styles.addColBanner}>
              <input
                style={styles.colInput}
                placeholder="Naye column ka naam (jaise: Due Date, Amount, Remarks)"
                value={newColLabel}
                onChange={(e) => setNewColLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                autoFocus
              />
              <button style={styles.colConfirmBtn} onClick={handleAddColumn}>
                Add Column ✓
              </button>
              <button style={styles.colCancelBtn} onClick={() => setShowAddCol(false)}>
                Cancel
              </button>
            </div>
          )}

          {/* ── EXCEL GRID SPREADSHEET ── */}
          <div style={styles.gridContainer}>
            <table style={styles.excelTable}>
              <thead>
                <tr>
                  <th style={styles.rowHeaderTh}>#</th>
                  {sheet.columns.map((col, idx) => (
                    <th
                      key={col.id}
                      style={{
                        ...styles.colTh,
                        borderTop: `3px solid ${col.color || "#4F46E5"}`,
                      }}
                    >
                      <div style={styles.colHeaderContent}>
                        <span style={styles.colLetterBadge}>
                          {String.fromCharCode(65 + (idx % 26))}
                        </span>
                        <span style={styles.colLabelText}>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th style={styles.actionTh}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rIdx) => (
                  <tr key={row._id} style={styles.tableRow}>
                    <td style={styles.rowNumberCell}>{rIdx + 1}</td>
                    {sheet.columns.map((col) => (
                      <td key={col.id} style={styles.cellTd}>
                        <input
                          style={styles.cellInputField}
                          value={row.values?.[col.id] || ""}
                          placeholder="—"
                          onChange={(e) => handleCellChange(row._id, col.id, e.target.value)}
                          onBlur={(e) => handleCellBlur(row._id, col.id, e.target.value)}
                        />
                        {savingCell === `${row._id}:${col.id}` && (
                          <span style={styles.savingIndicator} title="Saving..." />
                        )}
                      </td>
                    ))}
                    <td style={styles.actionCell}>
                      <button
                        style={styles.deleteRowBtn}
                        onClick={() => handleDeleteRow(row._id)}
                        title="Delete Row"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={sheet.columns.length + 2} style={styles.emptyGridCell}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>📝</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                        {searchQuery ? "Koi matching row nahi mili" : "Sheet khali hai"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                        Neeche diye button se nayi row add karo aur likhna shuru karo.
                      </div>
                      <button style={styles.emptyAddBtn} onClick={handleAddRow}>
                        + Add First Row
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER BAR ── */}
          <div style={styles.footerBar}>
            <button style={styles.addRowBottomBtn} onClick={handleAddRow}>
              <span style={{ fontSize: 16 }}>+</span>
              <span>Nayi Row Likho</span>
            </button>
            <div style={styles.footerHint}>
              ⚡ Real-time cloud sync · Auto-saves on blur
            </div>
          </div>
        </div>

        {showHistory && <SheetHistoryModal sheetId={sheetId} onClose={() => setShowHistory(false)} />}
      </div>
    </ModalPortal>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(6px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  modal: {
    width: "100%",
    maxWidth: 960,
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
    overflow: "hidden",
  },
  ribbon: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border, #e2e8f0)",
    background: "var(--surface-2, #f8fafc)",
  },
  ribbonLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  excelIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "linear-gradient(135deg, #10B981, #059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#fff",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    color: "var(--text)",
  },
  sheetMeta: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    marginTop: 1,
  },
  ribbonRight: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  exportBtn: {
    background: "linear-gradient(135deg, #4F46E5, #06B6D4)",
    color: "#ffffff",
    border: "none",
    borderRadius: 9,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 3px 10px rgba(79, 70, 229, 0.28)",
  },
  iconBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    width: 34,
    height: 34,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    width: 34,
    height: 34,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 18px",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    gap: 10,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "6px 12px",
    flex: 1,
    minWidth: 180,
    maxWidth: 320,
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: 12.5,
    width: "100%",
  },
  clearSearch: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 12,
    cursor: "pointer",
  },
  addColBtn: {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  addRowTopBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  addColBanner: {
    display: "flex",
    gap: 8,
    padding: "10px 18px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
    alignItems: "center",
  },
  colInput: {
    flex: 1,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "var(--text)",
    fontSize: 13,
  },
  colConfirmBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  colCancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  gridContainer: {
    flex: 1,
    overflow: "auto",
    background: "var(--surface)",
    minHeight: 280,
  },
  excelTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    minWidth: 500,
  },
  rowHeaderTh: {
    width: 44,
    minWidth: 44,
    background: "var(--surface-2)",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 11,
    fontWeight: 800,
    borderBottom: "2px solid var(--border)",
    borderRight: "1px solid var(--border)",
    userSelect: "none",
  },
  colTh: {
    background: "var(--surface-2)",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 700,
    borderBottom: "2px solid var(--border)",
    borderRight: "1px solid var(--border-soft)",
    minWidth: 140,
    whiteSpace: "nowrap",
  },
  colHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  colLetterBadge: {
    fontSize: 10,
    color: "var(--text-muted)",
    background: "var(--surface)",
    padding: "2px 6px",
    borderRadius: 4,
    border: "1px solid var(--border)",
    fontWeight: 900,
  },
  colLabelText: {
    color: "var(--text)",
    fontSize: 13,
    fontWeight: 700,
  },
  actionTh: {
    width: 42,
    background: "var(--surface-2)",
    borderBottom: "2px solid var(--border)",
  },
  tableRow: {
    borderBottom: "1px solid var(--border-soft)",
    transition: "background 0.1s ease",
  },
  rowNumberCell: {
    textAlign: "center",
    color: "var(--text-faint)",
    fontSize: 11,
    fontWeight: 800,
    background: "var(--surface-2)",
    borderRight: "1px solid var(--border)",
    userSelect: "none",
  },
  cellTd: {
    padding: 0,
    borderRight: "1px solid var(--border-soft)",
    position: "relative",
  },
  cellInputField: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "11px 14px",
    color: "var(--text)",
    fontSize: 13.5,
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  savingIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10B981",
  },
  actionCell: {
    textAlign: "center",
    padding: "4px",
  },
  deleteRowBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 13,
    cursor: "pointer",
    padding: 4,
    opacity: 0.5,
    transition: "opacity 0.15s ease",
  },
  emptyGridCell: {
    textAlign: "center",
    padding: "48px 16px",
    color: "var(--text-muted)",
  },
  emptyAddBtn: {
    marginTop: 12,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  footerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface-2)",
    gap: 10,
    flexWrap: "wrap",
  },
  addRowBottomBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 2px 8px var(--accent-glow)",
  },
  footerHint: {
    fontSize: 11.5,
    color: "var(--text-muted)",
  },
  actionBtnPrimary: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  actionBtnSecondary: {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    cursor: "pointer",
  },
};
