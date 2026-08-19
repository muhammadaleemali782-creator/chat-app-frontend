import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useBackHandler } from "../utils/backHandlerStack";
import LoadingScreen from "./LoadingScreen.jsx";
import SheetHistoryModal from "./SheetHistoryModal.jsx";
import ModalPortal from "./ModalPortal.jsx";

const COLOR_OPTIONS = [
  "#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444",
  "#EC4899", "#8B5CF6", "#3B82F6", "#14B8A6", "#64748B",
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
      setSheet(res.data);
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
    if (!window.confirm("Yeh entry delete karni hai?")) return;
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
          <div style={{ ...styles.modal, padding: 24, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Sheet load nahi hui</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px" }}>
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
          {/* ── HEADER ── */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.excelBadge}>📊 EXCEL</span>
              <div>
                <div style={styles.headerTitle}>{sheet.name}</div>
                <div style={styles.headerSub}>
                  {sheet.rows.length} rows · {sheet.columns.length} columns · {sheet.isOwner ? "👑 Aap Owner ho" : "Shared"}
                </div>
              </div>
            </div>

            <div style={styles.headerActions}>
              <button
                style={styles.exportBtn}
                onClick={() => exportSheetCSV(sheet)}
                title="Download Excel / CSV File"
              >
                <span>⬇</span>
                <span className="hide-on-mobile">Download (.csv)</span>
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

          {/* ── TOOLBAR ── */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <span style={{ fontSize: 13 }}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Sheet mein search karo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button style={styles.clearSearchBtn} onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button style={styles.addFieldBtn} onClick={() => setShowAddCol((v) => !v)}>
                + Add Column
              </button>
              <button style={styles.addRowTopBtn} onClick={handleAddRow}>
                + Add Row
              </button>
            </div>
          </div>

          {/* ── ADD COLUMN POPUP ── */}
          {showAddCol && (
            <div style={styles.addColBox}>
              <input
                style={styles.input}
                placeholder="Column ka naam (jaise: Name, Amount, Status)"
                value={newColLabel}
                onChange={(e) => setNewColLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                autoFocus
              />
              <button style={styles.addColConfirmBtn} onClick={handleAddColumn}>
                Add Column ✓
              </button>
              <button style={styles.addColCancelBtn} onClick={() => setShowAddCol(false)}>
                Cancel
              </button>
            </div>
          )}

          {/* ── EXCEL GRID TABLE ── */}
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.rowNumberTh}>#</th>
                  {sheet.columns.map((col, idx) => (
                    <th key={col.id} style={{ ...styles.th, borderTop: `3px solid ${col.color || "#4F46E5"}` }}>
                      <div style={styles.colHeaderTitle}>
                        <span style={styles.colLetter}>{String.fromCharCode(65 + idx)}</span>
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th style={styles.actionTh}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rIdx) => (
                  <tr key={row._id} style={styles.tr}>
                    <td style={styles.rowNumberTd}>{rIdx + 1}</td>
                    {sheet.columns.map((col) => (
                      <td key={col.id} style={styles.td}>
                        <input
                          style={styles.cellInput}
                          value={row.values?.[col.id] || ""}
                          placeholder="—"
                          onChange={(e) => handleCellChange(row._id, col.id, e.target.value)}
                          onBlur={(e) => handleCellBlur(row._id, col.id, e.target.value)}
                        />
                        {savingCell === `${row._id}:${col.id}` && (
                          <span style={styles.savingDot} title="Saving..." />
                        )}
                      </td>
                    ))}
                    <td style={styles.actionTd}>
                      <button
                        style={styles.rowDeleteBtn}
                        onClick={() => handleDeleteRow(row._id)}
                        title="Row Delete Karo"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={sheet.columns.length + 2} style={styles.emptyCell}>
                      {searchQuery
                        ? "Koi match nahi mila"
                        : "Koi entry nahi hai abhi — '+ Add Row' pe click karke data bharna shuru karo!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER ── */}
          <div style={styles.footer}>
            <button style={styles.addRowBottomBtn} onClick={handleAddRow}>
              <span>+</span>
              <span>Nayi Row Likho</span>
            </button>
            <div style={styles.footerNote}>
              💡 Ultra-lightweight cloud sync · Auto-saves on blur
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
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  modal: {
    width: "100%",
    maxWidth: 900,
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border, #e2e8f0)",
    background: "var(--surface-2, #f8fafc)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  excelBadge: {
    background: "#10B981",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.06em",
    padding: "4px 8px",
    borderRadius: 6,
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
    color: "var(--text)",
  },
  headerSub: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    marginTop: 1,
  },
  headerActions: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  exportBtn: {
    background: "#4F46E5",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
  },
  iconBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 14,
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
    gap: 6,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "5px 10px",
    flex: 1,
    minWidth: 160,
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
  clearSearchBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 11,
    cursor: "pointer",
  },
  addFieldBtn: {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  addRowTopBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  addColBox: {
    display: "flex",
    gap: 8,
    padding: "10px 18px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
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
    fontWeight: 700,
    cursor: "pointer",
  },
  addColCancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  tableScroll: {
    flex: 1,
    overflow: "auto",
    background: "var(--surface)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    background: "var(--surface-2)",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: 700,
    borderBottom: "2px solid var(--border)",
    borderRight: "1px solid var(--border-soft)",
    whiteSpace: "nowrap",
  },
  rowNumberTh: {
    width: 42,
    minWidth: 42,
    background: "var(--surface-2)",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 11,
    fontWeight: 700,
    borderBottom: "2px solid var(--border)",
    borderRight: "1px solid var(--border)",
  },
  colHeaderTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "var(--text)",
    fontSize: 12.5,
  },
  colLetter: {
    fontSize: 10,
    color: "var(--text-muted)",
    background: "var(--surface)",
    padding: "1px 5px",
    borderRadius: 4,
    border: "1px solid var(--border)",
    fontWeight: 800,
  },
  actionTh: {
    width: 40,
    background: "var(--surface-2)",
    borderBottom: "2px solid var(--border)",
  },
  tr: {
    borderBottom: "1px solid var(--border-soft)",
  },
  rowNumberTd: {
    textAlign: "center",
    color: "var(--text-faint)",
    fontSize: 11,
    fontWeight: 700,
    background: "var(--surface-2)",
    borderRight: "1px solid var(--border)",
    userSelect: "none",
  },
  td: {
    padding: 0,
    borderRight: "1px solid var(--border-soft)",
    position: "relative",
  },
  cellInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  savingDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10B981",
  },
  actionTd: {
    textAlign: "center",
    padding: "4px",
  },
  rowDeleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 13,
    cursor: "pointer",
    padding: 4,
    opacity: 0.6,
  },
  emptyCell: {
    textAlign: "center",
    padding: "36px 16px",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  footer: {
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
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 2px 8px var(--accent-glow)",
  },
  footerNote: {
    fontSize: 11,
    color: "var(--text-muted)",
  },
  actionBtnPrimary: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  actionBtnSecondary: {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
  },
};
