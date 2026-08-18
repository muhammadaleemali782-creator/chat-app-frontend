import ThreeDTiltCard from "./ThreeDTiltCard.jsx";

export default function ThreeDCommunityWall() {
  const reviews = [
    {
      name: "Aman Varma",
      role: "Lead Engineer @ TechCorp",
      avatar: "👨‍💻",
      text: "Not needing a phone number is a game changer for developer communities. Blazing fast socket delivery!",
      rating: 5,
      tag: "Verified User"
    },
    {
      name: "Sneha Kapadia",
      role: "Product Designer",
      avatar: "👩‍🎨",
      text: "The built-in Smart Sheets inside chat saved our team from switching tabs 50 times a day. Incredible UI aesthetics.",
      rating: 5,
      tag: "Power User"
    },
    {
      name: "Vikram Malhotra",
      role: "Security Consultant",
      avatar: "🛡️",
      text: "The client-side PIN gate and pure @username routing gives peace of mind. Exactly what modern privacy should be.",
      rating: 5,
      tag: "Security Auditor"
    }
  ];

  return (
    <div className="community-wall-grid">
      {reviews.map((r, i) => (
        <ThreeDTiltCard key={i} className="review-card-3d" maxTilt={10}>
          <div className="review-card-inner">
            <div className="review-header">
              <div className="review-avatar">{r.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="review-name">{r.name}</div>
                <div className="review-role">{r.role}</div>
              </div>
              <span className="review-badge">{r.tag}</span>
            </div>

            <div className="review-stars">{"★".repeat(r.rating)}</div>
            <p className="review-text">&quot;{r.text}&quot;</p>
          </div>
        </ThreeDTiltCard>
      ))}
    </div>
  );
}
