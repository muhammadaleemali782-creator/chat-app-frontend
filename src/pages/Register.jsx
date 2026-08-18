import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import BrandPanel from "../components/BrandPanel.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import ThreeDTiltCard from "../components/ThreeDTiltCard.jsx";

export default function Register() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await api.post("/auth/register", {
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      login(res.data.token, res.data.user);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Brand Panel (Desktop) */}
      <BrandPanel
        heading="Sirf username se account banao."
        sub="No phone number required. Connect instantly and chat in high privacy."
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

            <h2 className="auth-title">Create Free Account</h2>
            <p className="auth-subtitle">Join Chatox in 15 seconds • No phone needed</p>

            {error && (
              <div className="auth-error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-element">
              {/* Full Name */}
              <div className="auth-field-group">
                <label className="auth-field-label">Display Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    className="auth-text-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="auth-field-group">
                <label className="auth-field-label">Unique Username</label>
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

              {/* Email */}
              <div className="auth-field-group">
                <label className="auth-field-label">Email (Private / Password Recovery)</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    className="auth-text-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    autoCapitalize="none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-text-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
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
                {loading ? "Creating account..." : "Sign Up for Chatox ⚡"}
              </button>

              {loading && (
                <div style={{ marginTop: 10 }}>
                  <LoadingScreen message="Setting up your account..." />
                </div>
              )}
            </form>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>{" "}
              <Link to="/login" className="auth-action-link">
                Login here →
              </Link>
            </div>
          </div>
        </ThreeDTiltCard>
      </div>
    </div>
  );
}
