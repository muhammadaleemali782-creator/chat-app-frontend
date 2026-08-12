import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", { params: { conversationId } });
      setTasks(res.data);
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
    if (!title.trim()) {
      setError("Task ka title do");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await api.post("/tasks", { conversationId, title: title.trim(), description });
      setTitle("");
      setDescription("");
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Task nahi ban paya");
    } finally {
      setCreating(false);
    }
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

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>📋 Tasks</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={styles.addBtn} onClick={() => setShowCreate((v) => !v)}>
              + Naya Task
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
              placeholder="Task ka title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              style={styles.textarea}
              placeholder="Details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <div style={styles.error}>{error}</div>}
            <button className="primary-btn" style={styles.submitBtn} disabled={creating}>
              {creating ? "De raha hai..." : "Sabko task do"}
            </button>
          </form>
        )}

        <div style={styles.body}>
          {loading && <LoadingScreen small message="" />}
          {!loading && tasks.length === 0 && (
            <div style={styles.empty}>Abhi koi task nahi hai.</div>
          )}
          {!loading &&
            tasks.map((task) => {
              const myResponse = task.responses.find((r) => (r.user?._id || r.user) === user.id);
              const isCreator = (task.createdBy?._id || task.createdBy) === user.id;
              const doneCount = task.responses.filter((r) => r.status === "done").length;

              return (
                <div key={task._id} style={styles.taskCard}>
                  <div style={styles.taskTitle}>{task.title}</div>
                  {task.description && <div style={styles.taskDesc}>{task.description}</div>}
                  <div style={styles.taskMeta}>
                    {isCreator
                      ? `${doneCount}/${task.responses.length} ne kar diya`
                      : `Diya: ${task.createdBy?.displayName || "Kisi ne"}`}
                  </div>

                  {isCreator ? (
                    <div style={styles.responseList}>
                      {task.responses.map((r) => (
                        <div key={r.user?._id || r.user} style={styles.responseRow}>
                          <span style={styles.responseUser}>
                            {r.status === "done" ? "✅" : "⏳"} {r.user?.displayName}
                          </span>
                          {r.answer && <span style={styles.responseAnswer}>{r.answer}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    myResponse && (
                      <div style={styles.myResponseBox}>
                        <textarea
                          style={styles.textarea}
                          placeholder="Aapne kya kiya likho..."
                          value={
                            answerDrafts[task._id] !== undefined
                              ? answerDrafts[task._id]
                              : myResponse.answer
                          }
                          onChange={(e) =>
                            setAnswerDrafts((d) => ({ ...d, [task._id]: e.target.value }))
                          }
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <button
                            style={{
                              ...styles.statusBtn,
                              ...(myResponse.status === "done" ? styles.statusBtnDone : {}),
                            }}
                            onClick={() => handleRespond(task._id, "done")}
                          >
                            ✅ Kar diya
                          </button>
                          <button
                            style={styles.statusBtn}
                            onClick={() => handleRespond(task._id, "pending")}
                          >
                            Save karo
                          </button>
                        </div>
                      </div>
                    )
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
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "88vh",
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
  textarea: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 11px",
    color: "var(--text)",
    fontSize: 13,
    minHeight: 60,
    resize: "none",
    fontFamily: "inherit",
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
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
  body: { flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 },
  empty: { textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" },
  taskCard: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 12,
  },
  taskTitle: { fontSize: 14, fontWeight: 700 },
  taskDesc: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 },
  taskMeta: { fontSize: 11, color: "var(--accent)", fontWeight: 600, marginTop: 6 },
  responseList: { marginTop: 8, display: "flex", flexDirection: "column", gap: 5 },
  responseRow: { fontSize: 12, display: "flex", flexDirection: "column", gap: 1 },
  responseUser: { fontWeight: 600 },
  responseAnswer: { color: "var(--text-muted)", paddingLeft: 18 },
  myResponseBox: { marginTop: 8 },
  statusBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
  },
  statusBtnDone: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
};
