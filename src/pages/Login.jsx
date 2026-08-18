import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import BrandPanel from "../components/BrandPanel.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import ThreeDTiltCard from "../components/ThreeDTiltCard.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username: username.trim(), password });
      login(res.data.token, res.data.user);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Brand Panel (Desktop) */}
      <BrandPanel
        heading="Baat karo, bina phone number share kiye."
        sub="Connect purely via unique @username. Fast, private, and secure."
      />

      {/* Right Form Container */}
      <div className="auth-form-side">
        <ThreeDTiltCard maxTilt={8} scale={1.01} className="auth-card-wrapper">
          <div className="auth-card-inner">
            {/* Top Bar with Brand & Back Link */}
            <div className="auth-header-bar">
              <Link to="/" className="auth-brand-logo-wrap">
                <div className="landing-brand-logo" style={{ width: 34, height: 34, borderRadius: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="wordmark" style={{ fontSize: 24 }}>
                  Chatox<span className="dot" style={{ color: "var(--amber)" }}>.</span>
                </span>
              </Link>

              <Link to="/" className="auth-back-link">
                <span>←</span>
                <span>Home</span>
              </Link>
            </div>

            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login with your unique @username</p>

            {error && (
              <div className="auth-error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-element">
              {/* Username Input Group */}
              <div className="auth-field-group">
                <label className="auth-field-label">Username</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">@</span>
                  <input
                    className="auth-text-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahul_23"
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                  />
                </div>
              </div>

              {/* Password Input Group */}
              <div className="auth-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="auth-field-label">Password</label>
                  <Link to="/forgot-password" className="auth-forgot-link">
                    Forgot?
                  </Link>
                </div>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-text-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn btn-primary-glow" disabled={loading}>
                {loading ? "Logging in..." : "Login to Chatox 🚀"}
              </button>

              {loading && (
                <div style={{ marginTop: 10 }}>
                  <LoadingScreen message="Connecting securely..." />
                </div>
              )}
            </form>

            <div className="auth-footer-prompt">
              <span>Don't have an account?</span>{" "}
              <Link to="/register" className="auth-action-link">
                Create Free Account →
              </Link>
            </div>
          </div>
        </ThreeDTiltCard>
      </div>
    </div>
  );
}
