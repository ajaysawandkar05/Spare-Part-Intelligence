import { useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import PartFinderPage from "./components/PartFinderPage";

function DotGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let id, t = 0;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const cols = Math.ceil(c.width / 52), rows = Math.ceil(c.height / 52);
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const a = (Math.sin(t * 0.012 + i * 0.35 + j * 0.28) + 1) / 2 * 0.22 + 0.02;
          ctx.beginPath();
          ctx.arc(i * 52, j * 52, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,158,11,${a.toFixed(3)})`;
          ctx.fill();
        }
      }
      t++;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="lhero">
        <div className="lhero-bg" />
        <div className="lhero-overlay" />
        <DotGrid />
        <div className="lhero-scanlines" />
        {["tl","tr","bl","br"].map(p => <div key={p} className={`cb cb-${p}`} />)}

        <div className="lhero-body">
          <div className="lhero-split">

            {/* LEFT COLUMN */}
            <div className="lhero-left">
              <div className="lhud-row">
               
              </div>

              <p className="lhero-eyebrow">HWL SMART FACTORY · INDUSTRIAL AI PLATFORM</p>

              <h1 className="lhero-h1">
                SMART FACTORY<br />
                <span className="lhero-accent">Spare Part<br/>Recognition</span>
              </h1>

              <p className="lhero-sub">
                Upload a photo or describe any component — our AI instantly matches it
                to your live inventory. Built for factories, warehouses, and maintenance teams.
              </p>

              <div className="lhero-actions">
                <button className="lbtn-launch" onClick={() => navigate("/finder")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Launch Spare Part Finder
                  <span className="lbtn-arrow">→</span>
                </button>
                <a href="#features" className="lbtn-ghost">Explore Features</a>
              </div>

              <div className="lhero-stats">
                
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lhero-right">
              <div className="lhero-img-frame">
                {["tl","tr","bl","br"].map(p => <div key={p} className={`lhero-img-cb lhero-img-cb--${p}`} />)}
                <img
                  src="/src/assets/Industrie_SmartProducts_Ersatzteilerekennung_Handyaufnahme_Ersatzteil-1536x864.jpg"
                  alt="Technician scanning spare part with mobile phone"
                  className="lhero-img"
                />
                
                
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="l-section" id="features">
        <div className="l-inner">
          <p className="l-eyebrow">HOW IT WORKS</p>
          <h2 className="l-h2">Three steps to instant identification</h2>
          <div className="lsteps">
            {[
              ["01","Upload or Describe","Drop an image or type a description — or combine both for maximum accuracy."],
              ["02","AI Analysis","Vision + NLP models cross-reference 50,000+ catalogued parts in parallel."],
              ["03","Instant Results","Ranked matches appear in under 2 seconds with stock levels and bin locations."],
            ].map(([n,t,d],i) => (
              <div className="lstep" key={i}>
                <div className="lstep-num">{n}</div>
                <div className="lstep-title">{t}</div>
                <div className="lstep-desc">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="l-section l-section--alt">
        <div className="l-inner">
          <p className="l-eyebrow">CAPABILITIES</p>
          <h2 className="l-h2">Built for industrial environments</h2>
          <div className="lfeat-grid">
            {[
              ["Visual Recognition","Deep learning vision identifies parts from photos even under poor lighting or partial occlusion."],
              ["Text-Based Search","Describe brand, dimensions, or function in plain language — NLP finds the match."],
              ["Live Inventory Sync","Results show real-time stock counts, bin locations, and plant details — never stale."],
              ["Confidence Scoring","Multi-factor scores tell you exactly how certain each match is before you order."],
              ["Multi-Modal Fusion","Combine image and text for a hybrid query — the engine weights both signals automatically."],
              ["Sub-2s Response","Optimised inference delivers ranked results faster than a production line can pause."],
            ].map(([t,d],i) => (
              <div className="lfeat" key={i} style={{ animationDelay: `${i*0.07}s` }}>
                <div className="lfeat-num">0{i+1}</div>
                <div className="lfeat-title">{t}</div>
                <div className="lfeat-desc">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="l-cta">
        <div className="l-cta-inner">
          <div>
            <p className="l-eyebrow">READY TO BEGIN</p>
            <h2 className="l-cta-h2">Identify your first part in under 2 seconds</h2>
          </div>
          <button className="lbtn-launch lbtn-launch--lg" onClick={() => navigate("/finder")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            OPEN PART FINDER
            <span className="lbtn-arrow">→</span>
          </button>
        </div>
      </section>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <Routes>
          <Route path="/"       element={<LandingPage />} />
          <Route path="/finder" element={<PartFinderPage />} />
          <Route path="/about"  element={<AboutSection />} />
          <Route path="/contact" element={<ContactSection />} />
        </Routes>
      </div>
    </Router>
  );
}