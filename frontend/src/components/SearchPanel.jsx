import { useState, useRef, useCallback } from "react";
import CameraModal from "./CameraModal";

const PART_TYPES = [
  "All","photoelectric sensor","relay","actuator","pneumatic","connector",
  "bracket","cable","screw","handle","valve","spring","pin","shaft",
  "drill bit","cutting","terminal block","control panel",
];

export default function SearchPanel({ onSearch, loading }) {
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [text, setText]             = useState("");
  const [dragging, setDragging]     = useState(false);
  const [visualWeight, setVW]       = useState(0.5);
  const [topK, setTopK]             = useState(5);
  const [showAdv, setShowAdv]       = useState(false);
  const [partType, setPartType]     = useState("All");
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef();

  const setFile = (f) => {
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearImage = () => { setImage(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleCameraCapture = (file) => {
    setFile(file);
    setCameraOpen(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("image/")) setFile(f);
  }, []);

  const mode = image && text ? "multimodal" : image ? "visual" : text ? "text" : null;
  const canSearch = (image || text.trim()) && !loading;

  const modeLabels = { multimodal:"⬡ Multi-modal", visual:"◈ Visual Only", text:"◎ Text Only" };
  const modeColors = { multimodal:"var(--amber)", visual:"var(--blue)", text:"var(--teal)" };

  return (
    <section className="sp-wrap">
      {/* Panel header */}
      <div className="sp-head">
        <div className="sp-head-left">
          <span className="sp-head-label">SEARCH PARAMETERS</span>
          {mode && (
            <span className="sp-mode-badge" style={{ color: modeColors[mode], borderColor: modeColors[mode] }}>
              {modeLabels[mode]}
            </span>
          )}
        </div>
        <button className="sp-adv-toggle" onClick={() => setShowAdv(p => !p)}>
          {showAdv ? "Hide advanced ▲" : "Advanced ▼"}
        </button>
      </div>

      <div className="sp-grid">
        {/* Upload zone */}
        <div
          className={`sp-upload${dragging ? " sp-upload--drag" : ""}${preview ? " sp-upload--filled" : ""}`}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !preview && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
            onChange={e => setFile(e.target.files?.[0])} />
          {preview ? (
            <div className="sp-preview-wrap">
              <img src={preview} alt="Query" className="sp-preview-img" />
              <button className="sp-clear-btn" onClick={e => { e.stopPropagation(); clearImage(); }}>✕</button>
              <div className="sp-preview-badge">QUERY IMAGE</div>
            </div>
          ) : (
            <div className="sp-upload-ph">
              <div className="sp-upload-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                  <circle cx="6.5" cy="6" r="0.5" fill="currentColor"/>
                </svg>
              </div>
              <p className="sp-upload-title">Drop part image here</p>
              <p className="sp-upload-sub">or click to browse · JPG, PNG, WEBP</p>
              <button 
                className="sp-camera-btn" 
                onClick={(e) => { e.stopPropagation(); setCameraOpen(true); }}
                title="Capture photo with camera"
              >
                📷 Or use camera
              </button>
              <div className="sp-upload-corners">
                {["tl","tr","bl","br"].map(p => <span key={p} className={`sp-corner sp-corner--${p}`} />)}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="sp-controls">
          {/* Text input */}
          <div className="sp-field">
            <label className="sp-field-label">DESCRIPTION / PART ID</label>
            <input
              className="sp-input"
              type="text"
              placeholder="e.g. 'Festo solenoid valve 24V DC' or material ID..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && canSearch && onSearch({ image, text, visualWeight, textWeight: +(1-visualWeight).toFixed(2), topK, filterPartType: partType === "All" ? null : partType })}
            />
          </div>

          {/* Part type */}
          <div className="sp-field">
            <label className="sp-field-label">PART TYPE FILTER</label>
            <select className="sp-select" value={partType} onChange={e => setPartType(e.target.value)}>
              {PART_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Advanced */}
          {showAdv && (
            <div className="sp-adv">
              <div className="sp-adv-label">ADVANCED SETTINGS</div>

              <div className="sp-slider-row">
                <div className="sp-slider-labels">
                  <span>Results</span>
                  <span className="sp-slider-val">{topK}</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={topK} onChange={e => setTopK(+e.target.value)} className="sp-range" />
              </div>

              <div className="sp-slider-row">
                <div className="sp-slider-labels">
                  <span>Visual weight</span>
                  <span className="sp-slider-val">{Math.round(visualWeight * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={visualWeight}
                  onChange={e => setVW(+e.target.value)} disabled={!image || !text} className="sp-range" />
              </div>

              <div className="sp-weight-bar-row">
                <span>Visual {Math.round(visualWeight*100)}%</span>
                <div className="sp-weight-track">
                  <div className="sp-weight-fill" style={{ width:`${visualWeight*100}%` }} />
                </div>
                <span>Text {Math.round((1-visualWeight)*100)}%</span>
              </div>
            </div>
          )}

          {/* Search button */}
          <button
            className={`sp-btn${loading ? " sp-btn--loading" : ""}`}
            onClick={() => onSearch({ image, text, visualWeight, textWeight: +(1-visualWeight).toFixed(2), topK, filterPartType: partType === "All" ? null : partType })}
            disabled={!canSearch}
          >
            {loading ? (
              <><span className="sp-spinner" /> SCANNING INVENTORY…</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                FIND MATCHING PARTS
              </>
            )}
          </button>
        </div>
      </div>

      <CameraModal 
        isOpen={cameraOpen} 
        onCapture={handleCameraCapture} 
        onClose={() => setCameraOpen(false)} 
      />
    </section>
  );
}
