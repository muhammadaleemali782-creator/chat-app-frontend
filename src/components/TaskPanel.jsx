import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import ModalPortal from "./ModalPortal.jsx";

// ─── CSV export helper ──────────────────────────────────────────────────────
function exportTasksCSV(tasks) {
  if (!tasks.length) return;
  const header = ["Task", "Description", "Assigned By", "Status", "Answer", "Responded At"];
  const rows = tasks.flatMap((t) =>
    t.responses.map((r) => [
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.createdBy?.displayName || ""}"`,
      r.status === "done" ? "Done" : "Pending",
      `"${(r.answer || "").replace(/"/g, '""')}"`,
      r.respondedAt ? new Date(r.respondedAt).toLocaleString("en-IN") : "",
    ])
  );
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TaskPanel({ conversationId, onClose }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState({});
  // Edit mode: { [taskId]: { title, description } }
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", { params: { conversationId } });
      setTasks(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Task ka title do"); return; }
    setCreating(true); setError("");
    try {
      await api.post("/tasks", { conversationId, title: title.trim(), description });
      setTitle(""); setDescription(""); setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Task nahi ban paya");
    } finally { setCreating(false); }
  };

  const handleRespond = async (taskId, status) => {
    const answer = answerDrafts[taskId] ?? "";
    try {
      await api.put(`/tasks/${taskId}/respond`, { status, answer });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Save nahi hua");
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
  };

  const cancelEdit = () => { setEditingTask(null); setEditTitle(""); setEditDesc(""); };

  const saveEdit = async (taskId) => {
    if (!editTitle.trim()) return;
    setEditSaving(true);
    try {
      await api.put(`/tasks/${taskId}`, { title: editTitle.trim(), description: editDesc });
      await load();
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Save nahi hua");
    } finally { setEditSaving(false); }
  };

  return (
    <ModalPortal>
      <div style={S.backdrop} onClick={onClose}>
        <div style={S.modal} onClick={(e) => e.stopPropagation()}>
          {/* ── HEADER ── */}
          <div style={S.header}>
            <span style={S.headerTitle}>📋 Tasks</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {tasks.length > 0 && (
                <button
                  style={S.exportBtn}
                  onClick={() => exportTasksCSV(tasks)}
                  title="Export to CSV"
                >
                  ⬇ CSV
                </button>
              )}
              <button style={S.addBtn} onClick={() => setShowCreate((v) => !v)}>
                + Task
              </button>
              <button style={S.closeBtn} onClick={onClose}>✕</button>
            </div>
          </div>

          {/* ── CREATE FORM ── */}
          {showCreate && (
            <form style={S.createForm} onSubmit={handleCreate}>
              <input
                style={S.input}
                placeholder="Task ka title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                style={S.textarea}
                placeholder="Details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {error && <div style={S.error}>{error}</div>}
              <button style={S.submitBtn} disabled={creating}>
                {creating ? "De raha hai..." : "Sabko task do ✓"}
              </button>
            </form>
          )}

          {/* ── TASK LIST ── */}
          <div style={S.body}>
            {loading && <LoadingScreen small message="" />}
            {!loading && tasks.length === 0 && (
              <div style={S.empty}>Abhi koi task nahi hai.</div>
            )}
            {!loading && tasks.map((task) => {
              const myResponse = task.responses.find(
                (r) => (r.user?._id || r.user) === user.id
              );
              const isCreator = (task.createdBy?._id || task.createdBy) === user.id;
              const doneCount = task.responses.filter((r) => r.status === "done").length;
              const totalCount = task.responses.length;
              const isEditing = editingTask === task._id;

              return (
                <div key={task._id} style={S.card}>
                  {/* ── EDIT MODE ── */}
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input
                        style={S.input}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <textarea
                        style={S.textarea}
                        value={editDesc}
                        placeholder="Details (optional)"
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          style={S.submitBtn}
                          disabled={editSaving}
                          onClick={() => saveEdit(task._id)}
                        >
                          {editSaving ? "Saving..." : "Save ✓"}
                        </button>
                        <button style={S.actBtn} onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ── CARD HEADER ── */}
                      <div style={S.cardHead}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={S.cardTitle}>{task.title}</div>
                          {task.description && (
                            <div style={S.cardDesc}>{task.description}</div>
                          )}
                          <div style={S.cardMeta}>
                            {isCreator
                              ? <span style={{ color: "var(--accent)" }}>
                                  ✓ {doneCount}/{totalCount} done
                                </span>
                              : <span>by {task.createdBy?.displayName || "Someone"}</span>}
                          </div>
                        </div>
                        {isCreator && (
                          <button
                            style={S.editIconBtn}
                            onClick={() => startEdit(task)}
                            title="Edit task"
                          >
                            ✏️
                          </button>
                        )}
                      </div>

                      {/* ── CREATOR VIEW: response list ── */}
                      {isCreator && (
                        <div style={S.responseList}>
                          {task.responses.map((r) => (
                            <div key={r.user?._id || r.user} style={S.responseRow}>
                              <span style={S.respStatus}>
                                {r.status === "done" ? "✅" : "⏳"}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={S.respName}>{r.user?.displayName}</span>
                                {r.answer && (
                                  <div style={S.respAnswer}>{r.answer}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── MEMBER VIEW: fill my response ── */}
                      {!isCreator && myResponse && (
                        <div style={S.myBox}>
                          <textarea
                            style={S.textarea}
                            placeholder="Kya kiya likho..."
                            value={
                              answerDrafts[task._id] !== undefined
                                ? answerDrafts[task._id]
                                : myResponse.answer
                            }
                            onChange={(e) =>
                              setAnswerDrafts((d) => ({ ...d, [task._id]: e.target.value }))
                            }
                          />
                          <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                            <button
                              style={{
                                ...S.actBtn,
                                ...(myResponse.status === "done"
                                  ? { background: "var(--accent)", color: "#fff", border: "none" }
                                  : {}),
                              }}
                              onClick={() => handleRespond(task._id, "done")}
                            >
                              ✅ Kar diya
                            </button>
                            <button
                              style={S.actBtn}
                              onClick={() => handleRespond(task._id, "pending")}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,8,14,0.55)",
    zIndex: 9000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backdropFilter: "blur(2px)",
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  headerTitle: { fontSize: 14.5, fontWeight: 700 },
  exportBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  addBtn: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: 7,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    width: 26,
    height: 26,
    borderRadius: "50%",
    cursor: "pointer",
  },
  createForm: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface-2)",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    padding: "7px 10px",
    color: "var(--text)",
    fontSize: 13,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    padding: "7px 10px",
    color: "var(--text)",
    fontSize: 12.5,
    minHeight: 54,
    resize: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  error: {
    background: "rgba(240,98,95,0.1)",
    color: "var(--danger)",
    padding: "5px 9px",
    borderRadius: 7,
    fontSize: 11.5,
  },
  submitBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "8px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  actBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    cursor: "pointer",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: { textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" },
  card: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  cardHead: { display: "flex", gap: 8, alignItems: "flex-start" },
  cardTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 },
  cardDesc: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 },
  cardMeta: { fontSize: 11, marginTop: 4, color: "var(--text-faint)", fontWeight: 600 },
  editIconBtn: {
    background: "transparent",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    padding: "0 2px",
    flexShrink: 0,
    lineHeight: 1,
  },
  responseList: { marginTop: 8, display: "flex", flexDirection: "column", gap: 4 },
  responseRow: {
    display: "flex",
    gap: 7,
    alignItems: "flex-start",
    fontSize: 12,
    padding: "4px 0",
    borderTop: "1px solid var(--border-soft)",
  },
  respStatus: { fontSize: 13, flexShrink: 0, marginTop: 0 },
  respName: { fontWeight: 700, color: "var(--text)", fontSize: 12 },
  respAnswer: {
    color: "var(--text-muted)",
    fontSize: 11.5,
    marginTop: 1,
    lineHeight: 1.4,
  },
  myBox: { marginTop: 8 },
};
