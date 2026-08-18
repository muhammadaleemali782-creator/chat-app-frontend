export default function Floating3DOrbs() {
  return (
    <div className="floating-orbs-container" aria-hidden="true">
      {/* 3D Floating Orb 1: Sapphire Blue Gradient Sphere */}
      <div className="orb orb-1">
        <div className="orb-inner" />
      </div>

      {/* 3D Floating Orb 2: Ocean Cyan Sphere */}
      <div className="orb orb-2">
        <div className="orb-inner" />
      </div>

      {/* 3D Floating Orb 3: Emerald Glow Sphere */}
      <div className="orb orb-3">
        <div className="orb-inner" />
      </div>

      {/* 3D Floating Geometric Cube / Badge */}
      <div className="floating-3d-badge badge-top-right">
        <span className="badge-3d-icon">⚡</span>
        <div className="badge-3d-text">
          <strong>Sub-30ms</strong>
          <span>WebSocket v4</span>
        </div>
      </div>

      <div className="floating-3d-badge badge-bottom-left">
        <span className="badge-3d-icon">🛡️</span>
        <div className="badge-3d-text">
          <strong>Zero Leak</strong>
          <span>Phone-free ID</span>
        </div>
      </div>
    </div>
  );
}
