import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import BrandPanel from "../components/BrandPanel.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function Register() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await api.post("/auth/register", {
        username,
        displayName,
        email,
        password,
      });
      login(res.data.token, res.data.user);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap} className="auth-page-wrap">
      <BrandPanel
        heading="Sirf username se account banao."
        sub="Phone number kisi ko nahi dikhta — bas login ke liye."
      />
      <div style={styles.formSide}>
        <div className="auth-card" style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div className="wordmark" style={{ fontSize: 26 }}>
              Chatox<span className="dot">.</span>
            </div>
            <Link to="/" style={{ fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              ← Home
            </Link>
          </div>
          <p style={styles.subtitle}>Naya account banao — sirf username se</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Apna naam</label>
            <input
              style={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="jaise: Rahul Sharma"
              required
            />

            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="lowercase, numbers, underscore"
              autoCapitalize="none"
              required
            />

            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jaise: rahul@gmail.com"
              autoCapitalize="none"
              required
            />
            <p style={styles.emailNote}>
              Ye kisi ko nahi dikhega — sirf password bhool jaane pe kaam aayega
            </p>

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="kam se kam 6 characters"
              required
            />

            {error && <div style={styles.error}>{error}</div>}

            <button className="primary-btn" style={styles.button} disabled={loading}>
              {loading ? "Account ban raha hai..." : "Account banao"}
            </button>
            {loading && (
              <div style={{ marginTop: 4 }}>
                <LoadingScreen message="Connect ho rahe hain..." />
              </div>
            )}
          </form>

          <p style={styles.footerText}>
            Pehle se account hai?{" "}
            <Link to="/login" style={styles.link}>
              Login karo
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
    overflowY: "auto",
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
  emailNote: { fontSize: 11.5, color: "var(--text-faint)", margin: "4px 0 0" },
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
