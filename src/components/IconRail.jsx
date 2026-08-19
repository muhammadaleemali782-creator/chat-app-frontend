import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { avatarColor } from "../utils/avatarColor";
import ModalPortal from "./ModalPortal.jsx";

const THEME_PALETTES = {
  blue: {
    icon: "🔵",
    label: "Royal Blue & White",
    desc: "Reference 3D Workspace Theme",
    railBg: "linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)",
    accent: "#4F46E5",
    accentSoft: "rgba(79, 70, 229, 0.12)",
    text: "#E0E7FF",
    subText: "#C7D2FE",
    pillBg: "rgba(255, 255, 255, 0.14)",
    pillBorder: "rgba(255, 255, 255, 0.22)",
    cardActiveBorder: "#4F46E5",
    cardActiveBg: "#EEF2FF",
  },
  chatox: {
    icon: "🌊",
    label: "Chatox Teal",
    desc: "Teal green wave mobile theme",
    railBg: "linear-gradient(180deg, #0D9488 0%, #0F766E 100%)",
    accent: "#0D9488",
    accentSoft: "rgba(13, 148, 136, 0.12)",
    text: "#CCFBF1",
    subText: "#99F6E4",
    pillBg: "rgba(255, 255, 255, 0.16)",
    pillBorder: "rgba(255, 255, 255, 0.26)",
    cardActiveBorder: "#0D9488",
    cardActiveBg: "#F0FDFA",
  },
  pinky: {
    icon: "🌸",
    label: "Pinky Rose",
    desc: "Vibrant pink bubbles theme",
    railBg: "linear-gradient(180deg, #F43F5E 0%, #E11D48 100%)",
    accent: "#F43F5E",
    accentSoft: "rgba(244, 63, 94, 0.12)",
    text: "#FFE4E6",
    subText: "#FECDD3",
    pillBg: "rgba(255, 255, 255, 0.16)",
    pillBorder: "rgba(255, 255, 255, 0.26)",
    cardActiveBorder: "#F43F5E",
    cardActiveBg: "#FFF1F2",
  },
  talkiepro: {
    icon: "🟣",
    label: "TalkiePro Dark",
    desc: "Deep navy indigo style",
    railBg: "linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)",
    accent: "#8B5CF6",
    accentSoft: "rgba(139, 92, 246, 0.16)",
    text: "#E9D5FF",
    subText: "#DDD6FE",
    pillBg: "rgba(255, 255, 255, 0.14)",
    pillBorder: "rgba(255, 255, 255, 0.22)",
    cardActiveBorder: "#8B5CF6",
    cardActiveBg: "#F5F3FF",
  },
  dark: {
    icon: "🌙",
    label: "Midnight Dark",
    desc: "High contrast dark mode",
    railBg: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
    accent: "#38BDF8",
    accentSoft: "rgba(56, 189, 248, 0.16)",
    text: "#CBD5E1",
    subText: "#94A3B8",
    pillBg: "rgba(255, 255, 255, 0.09)",
    pillBorder: "rgba(255, 255, 255, 0.15)",
    cardActiveBorder: "#38BDF8",
    cardActiveBg: "#F0F9FF",
  },
  light: {
    icon: "☀️",
    label: "Pure Light",
    desc: "Clean modern light theme",
    railBg: "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)",
    accent: "#2563EB",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    text: "#DBEAFE",
    subText: "#BFDBFE",
    pillBg: "rgba(255, 255, 255, 0.15)",
    pillBorder: "rgba(255, 255, 255, 0.25)",
    cardActiveBorder: "#2563EB",
    cardActiveBg: "#EFF6FF",
  },
  white: {
    icon: "⚪",
    label: "Minimal White",
    desc: "Monochrome minimal layout",
    railBg: "linear-gradient(180deg, #334155 0%, #1E293B 100%)",
    accent: "#3B82F6",
    accentSoft: "rgba(59, 130, 246, 0.1)",
    text: "#E2E8F0",
    subText: "#94A3B8",
    pillBg: "rgba(255, 255, 255, 0.1)",
    pillBorder: "rgba(255, 255, 255, 0.2)",
    cardActiveBorder: "#3B82F6",
    cardActiveBg: "#F1F5F9",
  },
};

export default function IconRail({ page, onPageChange, hideOnMobileChat, onOpenProfile }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const color = avatarColor(user?.displayName || "User");
  const initial = (user?.displayName || "?").charAt(0).toUpperCase();

  const currentTheme = THEME_PALETTES[theme] || THEME_PALETTES.blue;

  const navItems = [
    { key: "chat", label: "MESSAGES", icon: "💬", badge: "358" },
    { key: "calendar", label: "CALENDAR", icon: "📅", badge: null },
    { key: "calls", label: "CALLS", icon: "📞", badge: null },
  ];

  const [prevIndex, setPrevIndex] = useState(0);

  const [isFlowing, setIsFlowing] = useState(false);
  const activeIndex = Math.max(0, navItems.findIndex((i) => i.key === page));

  const handleNavClick = (key) => {
    const targetIdx = navItems.findIndex((i) => i.key === key);
    if (targetIdx !== activeIndex && targetIdx >= 0) {
      setPrevIndex(activeIndex);
      setIsFlowing(true);
      onPageChange(key);
      setTimeout(() => setIsFlowing(false), 580);
    }
  };

  return (
    <>
      {/* SVG Gooey Filter for True Liquid / Water / Venom Surface Tension */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="venom-liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <nav
        style={{
          ...styles.rail,
          width: collapsed ? 74 : 200,
          minWidth: collapsed ? 74 : 200,
          padding: collapsed ? "16px 8px" : "20px 0 16px 14px",
          background: currentTheme.railBg,
          transition: "width 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), min-width 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), background 0.35s ease",
        }}
        className={`icon-rail${hideOnMobileChat ? " icon-rail-hide-mobile" : ""}`}
        aria-label="Main Navigation"
      >
        {/* Top Header: Brand Wordmark + Collapse Toggle */}
        <div
          style={{
            ...styles.brandHeader,
            justifyContent: collapsed ? "center" : "space-between",
            paddingRight: collapsed ? 0 : 14,
          }}
        >
          {!collapsed && (
            <div style={styles.brandTitleWrap}>
              <div style={styles.brandIconCircle}>⚡</div>
              <span style={styles.brandTitle}>Chatox</span>
            </div>
          )}

          <button
            type="button"
            style={styles.collapseToggleBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Sidebar Expand Karo" : "Sidebar Collapse Karo"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* User Profile Pill / Avatar */}
        <div style={{ paddingRight: collapsed ? 0 : 14, marginBottom: 20 }}>
          <button
            type="button"
            style={{
              ...styles.userProfilePill,
              background: currentTheme.pillBg,
              borderColor: currentTheme.pillBorder,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "6px" : "7px 12px",
            }}
            onClick={onOpenProfile}
            title={`Profile: @${user?.username}`}
          >
            <div style={{ ...styles.userAvatar, background: color.bg, color: color.fg }}>
              {initial}
            </div>
            {!collapsed && (
              <div style={styles.userInfo}>
                <div style={{ ...styles.userName, color: "#FFFFFF" }}>{user?.displayName || "User"}</div>
                <div style={{ ...styles.userHandle, color: currentTheme.subText }}>@{user?.username || "me"}</div>
              </div>
            )}
          </button>
        </div>

        {/* Navigation List with Ultra-Smooth 120FPS Liquid Symbiote Wave */}
        <div style={styles.navList}>
          {!collapsed && <div style={styles.navSectionLabel}>NAVIGATION</div>}
          <div style={styles.navContainerRelative}>
            {!collapsed && (
              <>
                {/* Layer 1: Fluid Water Aura Ripple */}
                <div
                  className="liquid-aura-ripple"
                  style={{
                    transform: `translate3d(0, ${activeIndex * 48}px, 0)`,
                  }}
                />

                {/* Layer 2: Core Liquid Symbiote Scoop */}
                <div
                  className={`ultra-liquid-scoop ${isFlowing ? "liquid-flowing-stretch" : ""}`}
                  style={{
                    transform: `translate3d(0, ${activeIndex * 48}px, 0)`,
                    background: "var(--surface)",
                  }}
                />
              </>
            )}

            {navItems.map((item) => {
              const isActive = page === item.key;
              return (
                <div key={item.key} style={styles.navItemWrap}>
                  <button
                    key={item.key}
                    type="button"
                    style={{
                      ...styles.navBtn,
                      color: isActive ? currentTheme.accent : currentTheme.text,
                      fontWeight: isActive ? 900 : 700,
                      ...(collapsed ? styles.navBtnCollapsed : {}),
                      ...(isActive && collapsed
                        ? {
                            ...styles.navBtnCollapsedActive,
                            color: currentTheme.accent,
                            boxShadow: currentTheme.activeShadow,
                          }
                        : {}),
                    }}
                    className={`rail-nav-item ${isActive ? "rail-item-active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                    title={item.label}
                  >
                    <span style={styles.navIcon}>{item.icon}</span>
                    {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        style={{
                          ...styles.navBadge,
                          background: isActive ? currentTheme.accentSoft : "rgba(255, 255, 255, 0.25)",
                          color: isActive ? currentTheme.accent : "#FFFFFF",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>




        {/* Bottom Actions: Theme Selector & Logout */}
        <div
          style={{
            ...styles.bottomSection,
            paddingRight: collapsed ? 0 : 14,
          }}
        >
          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              color: currentTheme.subText,
              ...(collapsed ? styles.bottomBtnCollapsed : {}),
            }}
            onClick={() => setShowThemePicker(true)}
            title="Theme badlo"
          >
            <span style={{ fontSize: 16 }}>🎨</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>THEME / SETTINGS</span>}
          </button>

          <button
            type="button"
            style={{
              ...styles.bottomBtn,
              ...(collapsed ? styles.bottomBtnCollapsed : {}),
              color: "#FECACA",
            }}
            onClick={() => {
              if (window.confirm("Kya aap logout karna chahte hain?")) {
                logout();
              }
            }}
            title="Logout"
          >
            <span style={{ fontSize: 16 }}>🚪</span>
            {!collapsed && <span style={styles.bottomBtnLabel}>LOGOUT</span>}
          </button>
        </div>
      </nav>

      {/* Floating Theme Selector Modal */}
      {showThemePicker && (
        <ModalPortal>
          <div style={styles.themeBackdrop} onClick={() => setShowThemePicker(false)}>
            <div style={styles.themeModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.themeModalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🎨</span>
                  <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)", color: "#0F172A" }}>
                    Theme Choose Karo
                  </span>
                </div>
                <button
                  style={styles.themeModalClose}
                  onClick={() => setShowThemePicker(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div style={styles.themeGrid}>
                {Object.entries(THEME_PALETTES).map(([key, meta]) => {
                  const isActive = theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      style={{
                        ...styles.themeCard,
                        ...(isActive
                          ? {
                              background: meta.cardActiveBg,
                              borderColor: meta.cardActiveBorder,
                              boxShadow: `0 4px 16px ${meta.accentSoft}`,
                            }
                          : {}),
                      }}
                      onClick={() => {
                        setTheme(key);
                        setShowThemePicker(false);
                      }}
                    >
                      <span style={{ fontSize: 26, marginBottom: 2 }}>{meta.icon}</span>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: isActive ? meta.accent : "#0F172A",
                        }}
                      >
                        {meta.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, textAlign: "center" }}>
                        {meta.desc}
                      </div>
                      {isActive && (
                        <div
                          style={{
                            ...styles.themeActiveBadge,
                            background: meta.accent,
                          }}
                        >
                          ✓ Active Theme
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

const styles = {
  rail: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    zIndex: 10,
    userSelect: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    borderRadius: "24px 0 0 24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
    height: 34,
  },
  brandTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  collapseToggleBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.16)",
    border: "none",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, background 0.2s ease",
  },
  userProfilePill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid",
    borderRadius: 22,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 12,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userHandle: {
    fontSize: 10,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navSectionLabel: {
    fontSize: 9.5,
    fontWeight: 800,
    color: "rgba(255, 255, 255, 0.55)",
    letterSpacing: "0.08em",
    padding: "0 8px 4px",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  navContainerRelative: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  navItemWrap: {
    position: "relative",
  },

  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    borderRadius: "24px 0 0 24px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
    textAlign: "left",
    width: "100%",
  },
  navBtnCollapsed: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 44,
    height: 44,
    margin: "0 auto",
    borderRadius: "50%",
  },
  navBtnActive: {
    background: "#FFFFFF",
    fontWeight: 900,
  },
  navBtnCollapsedActive: {
    background: "#FFFFFF",
    fontWeight: 900,
    transform: "scale(1.06)",
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    flex: 1,
    whiteSpace: "nowrap",
  },
  navBadge: {
    fontSize: 9.5,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 10,
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: 14,
  },
  bottomBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    padding: "9px 10px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%",
  },
  bottomBtnCollapsed: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 44,
    height: 44,
    margin: "0 auto",
    borderRadius: "50%",
  },
  bottomBtnLabel: {
    flex: 1,
    whiteSpace: "nowrap",
  },
  themeBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  themeModal: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: "85vh",
    overflowY: "auto",
  },
  themeModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  themeModalClose: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 13,
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 10,
  },
  themeCard: {
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  themeActiveBadge: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 20,
  },
};
