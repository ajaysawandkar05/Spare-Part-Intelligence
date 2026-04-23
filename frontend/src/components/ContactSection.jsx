import React, { useState } from "react";

const ContactSection = () => {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const contacts = [
    {
      key: "email",
      label: "Email",
      value: "ajaysawandkar05@gmail.com",
      href: "mailto:ajaysawandkar05@gmail.com",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      value: "7888105310",
      displayValue: "+91 78881 05310",
      href: "tel:7888105310",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
  ];

  const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

        .contact-section {
          background: #0c0c0e;
          padding: 72px 32px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .contact-section::before {
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

        .contact-glow {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .contact-inner {
          max-width: 620px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .contact-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .contact-eyebrow-line {
          width: 32px;
          height: 2px;
          background: #F59E0B;
        }

        .contact-eyebrow-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #F59E0B;
        }

        .contact-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700;
          color: #fff;
          margin: 0 0 10px;
          line-height: 1.1;
          letter-spacing: -0.3px;
        }

        .contact-subheading {
          font-size: 15px;
          font-weight: 300;
          color: #6b6b7b;
          margin: 0 0 44px;
          line-height: 1.6;
        }

        .contact-card {
          border: 1px solid rgba(245,158,11,0.12);
          background: rgba(255,255,255,0.02);
          position: relative;
          overflow: hidden;
        }

        .contact-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent);
        }

        .contact-avatar-row {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 28px 28px 24px;
          border-bottom: 1px solid rgba(245,158,11,0.08);
        }

        .contact-avatar {
          width: 52px;
          height: 52px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #F59E0B;
          flex-shrink: 0;
          letter-spacing: 1px;
        }

        .contact-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 2px;
          letter-spacing: 0.3px;
        }

        .contact-role {
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #F59E0B;
          font-weight: 400;
        }

        .contact-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          margin-right: 6px;
          animation: pulse 2s ease infinite;
          vertical-align: middle;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .contact-rows {
          padding: 0 28px 28px;
        }

        .contact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 12px;
        }

        .contact-row:last-child {
          border-bottom: none;
        }

        .contact-row-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .contact-row-icon {
          color: #F59E0B;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .contact-row-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .contact-row-label {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #4a4a5a;
          margin-bottom: 3px;
        }

        .contact-row-value {
          font-size: 15px;
          color: #c8c8d8;
          font-weight: 400;
          text-decoration: none;
          transition: color 0.15s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .contact-row-value:hover {
          color: #F59E0B;
        }

        .contact-row-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .contact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid rgba(245,158,11,0.2);
          background: transparent;
          color: #6b6b7b;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          font-family: inherit;
        }

        .contact-btn:hover {
          border-color: rgba(245,158,11,0.5);
          color: #F59E0B;
          background: rgba(245,158,11,0.06);
        }

        .contact-btn.copied {
          border-color: rgba(34,197,94,0.4);
          color: #22c55e;
          background: rgba(34,197,94,0.06);
        }

        .contact-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .contact-footer-line {
          flex: 1;
          height: 1px;
          background: rgba(245,158,11,0.1);
        }

        .contact-footer-text {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #3a3a4a;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .contact-avatar-row { padding: 20px; }
          .contact-rows { padding: 0 20px 20px; }
          .contact-row-value { font-size: 13px; }
        }
      `}</style>

      <section className="contact-section" id="contact">
        <div className="contact-glow" />

        <div className="contact-inner">
          <div className="contact-eyebrow">
            <div className="contact-eyebrow-line" />
            <span className="contact-eyebrow-text">Get In Touch</span>
          </div>

          <h2 className="contact-heading">Contact</h2>
          <p className="contact-subheading">
            Questions about the platform? Reach out directly and we'll get back to you promptly.
          </p>

          <div className="contact-card">
            <div className="contact-avatar-row">
              <div className="contact-avatar">AS</div>
              <div>
                <p className="contact-name">Ajay Sawandkar</p>
                <p className="contact-role">
                  <span className="contact-status-dot" />
                  Project Lead · Available
                </p>
              </div>
            </div>

            <div className="contact-rows">
              {contacts.map((c) => (
                <div className="contact-row" key={c.key}>
                  <div className="contact-row-left">
                    <span className="contact-row-icon">{c.icon}</span>
                    <div className="contact-row-info">
                      <span className="contact-row-label">{c.label}</span>
                      <a href={c.href} className="contact-row-value">
                        {c.displayValue || c.value}
                      </a>
                    </div>
                  </div>
                  <div className="contact-row-actions">
                    <button
                      className={`contact-btn${copied === c.key ? " copied" : ""}`}
                      onClick={() => copyToClipboard(c.value, c.key)}
                      title="Copy"
                    >
                      {copied === c.key ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <a href={c.href} className="contact-btn" title={`Open ${c.label}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-footer">
            <div className="contact-footer-line" />
            <span className="contact-footer-text">Smart Factory Recognition System · 2025</span>
            <div className="contact-footer-line" />
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;