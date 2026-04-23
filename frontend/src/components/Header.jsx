import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const TICKER_MSGS = [
  "Industrial Parts Intelligence Platform",
  "HWL Spare Parts System v2.4",
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime]         = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const msgs = [...TICKER_MSGS, ...TICKER_MSGS];

  return (
    <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
      {/* Ticker */}
      <div className="hdr-ticker">
        <div className="hdr-ticker-track">
          {msgs.map((m, i) => <span key={i} className="hdr-ticker-item">{m}</span>)}
        </div>
      </div>

      {/* Main bar */}
      <div className="hdr-main">
        <div className="hdr-inner">

          {/* Logo */}
          <a href="/" className="hdr-logo" onClick={e => { e.preventDefault(); navigate("/"); }}>
            <div className="hdr-logo-frame">
              <img src="/src/assets/smart.png" alt="HWL Logo" className="hdr-logo-img" />
            </div>
            <div className="hdr-logo-text">
              <span className="hdr-logo-name">H<span>W</span>L</span>
              <span className="hdr-logo-sub">Spare Parts Intelligence</span>
            </div>
          </a>

          {/* Centre: status pills */}
          <div className="hdr-status">
            {[
              
            ].map(s => (
              <div className="hdr-pill" key={s.label}>
                <span className={`hdr-dot hdr-dot--${s.color}`} />
                {s.label}
              </div>
            ))}
            <div className="hdr-sep" />
            <div className="hdr-clock">
              <span className="hdr-clock-dot" />
              {time}
            </div>
          </div>

          {/* Right: nav + badge + toggle */}
          <div className="hdr-right">
            <nav className="hdr-nav">
              <NavLink to="/"        className={({ isActive }) => `hdr-link${isActive ? " hdr-link--active" : ""}`} end>Home</NavLink>
              <NavLink to="/finder"  className={({ isActive }) => `hdr-link${isActive ? " hdr-link--active" : ""}`}>Finder</NavLink>
              <NavLink to="/about"   className={({ isActive }) => `hdr-link${isActive ? " hdr-link--active" : ""}`}>About</NavLink>
              <NavLink to="/contact" className={({ isActive }) => `hdr-link${isActive ? " hdr-link--active" : ""}`}>Contact</NavLink>
            </nav>
            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}