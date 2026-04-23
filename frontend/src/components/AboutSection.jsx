import React, { useEffect, useRef } from "react";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    title: "AI-Powered Recognition",
    desc: "Advanced vision models identify parts from images in milliseconds with industry-grade accuracy.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: "Image & Text Queries",
    desc: "Upload a photo or describe a part — our hybrid engine handles both input modes seamlessly.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Error Elimination",
    desc: "Reduce costly misidentifications that cause downtime, wrong orders, and production halts.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Real-Time Matching",
    desc: "Live inventory sync ensures results are always current — no stale catalogs, no guesswork.",
  },
];

const AboutSection = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

        .about-section {
          background: #0c0c0e;
          padding: 80px 32px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .about-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(245, 158, 11, 0.018) 3px,
            rgba(245, 158, 11, 0.018) 4px
          );
          pointer-events: none;
        }

        .about-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .about-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border-color: #F59E0B;
          border-style: solid;
          opacity: 0.35;
        }
        .about-corner.tl { top: 20px; left: 20px; border-width: 2px 0 0 2px; }
        .about-corner.tr { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
        .about-corner.bl { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; }
        .about-corner.br { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }

        .about-inner {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .about-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .about-eyebrow-line {
          width: 32px;
          height: 2px;
          background: #F59E0B;
        }

        .about-eyebrow-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #F59E0B;
        }

        .about-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.1;
          color: #FFFFFF;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .about-heading span {
          color: #F59E0B;
        }

        .about-desc {
          font-size: 16px;
          font-weight: 300;
          color: #8a8a9a;
          line-height: 1.7;
          max-width: 580px;
          margin: 0 0 56px;
        }

        .about-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.12);
        }

        .feature-card {
          background: #0c0c0e;
          padding: 28px 24px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease, background 0.2s;
        }

        .feature-card:nth-child(1) { transition-delay: 0s; }
        .feature-card:nth-child(2) { transition-delay: 0.08s; }
        .feature-card:nth-child(3) { transition-delay: 0.16s; }
        .feature-card:nth-child(4) { transition-delay: 0.24s; }

        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-card:hover {
          background: rgba(245,158,11,0.05);
        }

        .feature-icon {
          color: #F59E0B;
          margin-bottom: 14px;
          display: block;
        }

        .feature-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: 0.3px;
        }

        .feature-desc {
          font-size: 13.5px;
          font-weight: 300;
          color: #6b6b7b;
          line-height: 1.65;
          margin: 0;
        }

        .about-stat-row {
          display: flex;
          gap: 40px;
          margin-top: 56px;
          padding-top: 40px;
          border-top: 1px solid rgba(245,158,11,0.1);
        }

        .about-stat {
          display: flex;
          flex-direction: column;
        }

        .about-stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #F59E0B;
          line-height: 1;
          margin-bottom: 4px;
        }

        .about-stat-label {
          font-size: 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #5a5a6a;
          font-weight: 400;
        }

        .about-scan-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #F59E0B, transparent);
          animation: scanDown 6s linear infinite;
          opacity: 0.4;
        }

        @keyframes scanDown {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @media (max-width: 600px) {
          .about-stat-row { gap: 24px; flex-wrap: wrap; }
          .about-features { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <section className="about-section" id="about">
        <div className="about-scan-bar" />
        <div className="about-grid-lines" />
        <div className="about-corner tl" />
        <div className="about-corner tr" />
        <div className="about-corner bl" />
        <div className="about-corner br" />

        <div className="about-inner">
          <div className="about-eyebrow">
            <div className="about-eyebrow-line" />
            <span className="about-eyebrow-text">Industrial AI Platform</span>
          </div>

          <h2 className="about-heading">
            Smart Factory<br />
            <span>Spare Part</span> Recognition
          </h2>

          <p className="about-desc">
            An AI-powered platform designed to streamline the identification and management of
            industrial spare parts — reducing downtime, eliminating human error, and keeping
            your operations running at full capacity.
          </p>

          <div className="about-features">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                ref={(el) => (cardRefs.current[i] = el)}
              >
                <span className="feature-icon">{f.icon}</span>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="about-stat-row">
            {[
              { n: "98.6%", l: "Recognition Accuracy" },
              { n: "<2s", l: "Avg. Match Time" },
              { n: "50K+", l: "Parts Catalogued" },
              { n: "24/7", l: "System Uptime" },
            ].map((s, i) => (
              <div className="about-stat" key={i}>
                <span className="about-stat-number">{s.n}</span>
                <span className="about-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;