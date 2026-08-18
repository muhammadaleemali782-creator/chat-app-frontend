import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import BrandPanel from "../components/BrandPanel.jsx";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email daalo, 2 = OTP + naya password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "OTP bhej diya gaya hai, apna email check karo");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, otp, newPassword });
      setMessage(res.data.message || "Password reset ho gaya");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap} className="auth-page-wrap">
      <BrandPanel
        heading="Password bhool gaye? Koi baat nahi."
        sub="Apne email pe OTP milega, usse naya password set kar lo."
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
          <p style={styles.subtitle}>
            {step === 1
              ? "Apna registered email daalo, OTP bhej denge"
              : "Email pe aaya OTP aur naya password daalo"}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} style={styles.form}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jaise: rahul@gmail.com"
                required
              />

              {error && <div style={styles.error}>{error}</div>}
              {message && <div style={styles.success}>{message}</div>}

              <button className="primary-btn" style={styles.button} disabled={loading}>
                {loading ? "Bhej rahe hain..." : "OTP bhejo"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} style={styles.form}>
              <label style={styles.label}>OTP (email mein dekho)</label>
              <input
                style={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                required
              />

              <label style={styles.label}>Naya password</label>
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="kam se kam 6 characters"
                required
              />

              {error && <div style={styles.error}>{error}</div>}
              {message && <div style={styles.success}>{message}</div>}

              <button className="primary-btn" style={styles.button} disabled={loading}>
                {loading ? "Reset ho raha hai..." : "Password reset karo"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={styles.secondaryBtn}
              >
                Email badalna hai? Wapas jao
              </button>
            </form>
          )}

          <p style={styles.footerText}>
            <Link to="/login" style={styles.link}>
              Login pe wapas jao
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
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 1.5,
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
  secondaryBtn: {
    marginTop: 10,
    background: "transparent",
    color: "var(--text-muted)",
    border: "none",
    fontSize: 13,
    padding: "6px 0",
  },
  error: {
    background: "rgba(240,98,95,0.12)",
    color: "var(--danger)",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginTop: 8,
  },
  success: {
    background: "rgba(94,200,170,0.12)",
    color: "#5ec8aa",
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
