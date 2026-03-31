export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="#F59E0B" />
              <rect x="16" y="2" width="10" height="10" rx="2" fill="#F59E0B" opacity="0.5" />
              <rect x="2" y="16" width="10" height="10" rx="2" fill="#F59E0B" opacity="0.5" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="#F59E0B" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">HWL</span>
            <span className="logo-sub">Spare Parts Intelligence</span>
          </div>
        </div>
        <div className="header-meta">
          <div className="meta-pill">
            <span className="dot dot--green" />
            Dino v2 & CLIP v2 Active
          </div>
          <div className="meta-pill">
            100 Materials Indexed
          </div>
        </div>
      </div>
    </header>
  );
}