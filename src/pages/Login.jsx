import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import BrandPanel from "../components/BrandPanel.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap} className="auth-page-wrap">
      <BrandPanel
        heading="Baat karo, bina number share kiye."
        sub="Username se dhundo, turant chat karo."
      />
      <div style={styles.formSide}>
        <div className="auth-card" style={styles.card}>
          <div className="wordmark" style={{ fontSize: 26, marginBottom: 4 }}>
            Chat<span className="dot">.</span>
          </div>
          <p style={styles.subtitle}>Apne username se login karo</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jaise: rahul_23"
              autoCapitalize="none"
              required
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <div style={styles.error}>{error}</div>}

            <button className="primary-btn" style={styles.button} disabled={loading}>
              {loading ? "Login ho raha hai..." : "Login"}
            </button>
            {loading && (
              <div style={{ marginTop: 4 }}>
                <LoadingScreen message="Connect ho rahe hain..." />
              </div>
            )}
          </form>

          <p style={{ ...styles.footerText, marginTop: 14, marginBottom: 0 }}>
            <Link to="/forgot-password" style={styles.link}>
              Password bhool gaye?
            </Link>
          </p>

          <p style={styles.footerText}>
            Account nahi hai?{" "}
            <Link to="/register" style={styles.link}>
              Naya account banao
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
  },
  formSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "32px 28px",
    boxShadow: "var(--shadow-soft)",
  },
  subtitle: {
    color: "var(--text-muted)",
    marginTop: 0,
    marginBottom: 28,
    fontSize: 14,
  },
  form: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "var(--text-muted)", marginTop: 10 },
  input: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "var(--text)",
    fontSize: 15,
  },
  button: {
    marginTop: 20,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    fontWeight: 600,
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginTop: 8,
  },
  footerText: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 14,
    marginTop: 24,
    marginBottom: 0,
  },
  link: { color: "var(--accent)", fontWeight: 600, textDecoration: "none" },
};
