import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import BrandPanel from "../components/BrandPanel.jsx";
import ThreeDTiltCard from "../components/ThreeDTiltCard.jsx";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setMessage(res.data.message || "OTP sent successfully! Please check your inbox.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check your email.");
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
      const res = await api.post("/auth/reset-password", { email: email.trim(), otp: otp.trim(), newPassword });
      setMessage(res.data.message || "Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or reset error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Brand Panel (Desktop) */}
      <BrandPanel
        heading="Password bhool gaye? Koi baat nahi."
        sub="We will send a fast verification OTP to your recovery email."
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

              <Link to="/login" className="auth-back-link">
                <span>←</span>
                <span>Login</span>
              </Link>
            </div>

            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {step === 1 ? "Enter your registered email to receive an OTP" : "Enter the verification OTP and your new password"}
            </p>

            {message && (
              <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "10px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 16, border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                <span>✅</span> {message}
              </div>
            )}

            {error && (
              <div className="auth-error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="auth-form-element">
                <div className="auth-field-group">
                  <label className="auth-field-label">Recovery Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      className="auth-text-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn btn-primary-glow" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send Verification Code ✉️"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="auth-form-element">
                <div className="auth-field-group">
                  <label className="auth-field-label">6-Digit OTP</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔢</span>
                    <input
                      className="auth-text-input"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">New Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      className="auth-text-input"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  {loading ? "Updating password..." : "Set New Password ⚡"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", marginTop: 6 }}
                >
                  Didn't get OTP? Try another email
                </button>
              </form>
            )}

            <div className="auth-footer-prompt">
              <span>Remembered your password?</span>{" "}
              <Link to="/login" className="auth-action-link">
                Back to Login →
              </Link>
            </div>
          </div>
        </ThreeDTiltCard>
      </div>
    </div>
  );
}
