import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "/";

function ScoreBar({ label, value, color }) {
  if (value == null) return null;
  const pct = Math.max(0, Math.min(1, value));
  const colors = { amber:"var(--amber)", teal:"var(--teal)", blue:"var(--blue)" };
  return (
    <div className="rc-score-row">
      <span className="rc-score-lbl">{label}</span>
      <div className="rc-score-track">
        <div className="rc-score-fill" style={{ width:`${pct*100}%`, background: colors[color] || colors.amber }} />
      </div>
      <span className="rc-score-num">{value.toFixed(3)}</span>
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="rcm-row">
      <span className="rcm-icon">{icon}</span>
      <span className="rcm-key">{label}</span>
      <span className="rcm-val">{value}</span>
    </div>
  );
}

export default function ResultCard({ result, isTop }) {
  const [imgError, setImgError] = useState(false);
  const [modal, setModal]       = useState(false);

  const { rank, material_id, final_score, visual_score, text_score, confidence,
    storage_bin, total_stock, storage_location, plant, duration, description } = result;

  const imgSrc = `${API}api/image/${encodeURIComponent(material_id)}`;

  return (
    <>
      <div
        className={`rc${isTop ? " rc--top" : ""}`}
        onClick={() => setModal(true)}
        tabIndex={0}
        role="button"
        onKeyDown={e => (e.key==="Enter"||e.key===" ") && setModal(true)}
      >
        {isTop && <div className="rc-top-badge">★ BEST MATCH</div>}
        <div className="rc-rank">#{rank}</div>

        {confidence === "low" && isTop && (
          <div className="rc-warn">⚠ Close match — try a clearer image</div>
        )}

        <div className="rc-img-wrap">
          {!imgError
            ? <img src={imgSrc} alt={material_id} className="rc-img" onError={() => setImgError(true)} />
            : <div className="rc-img-err">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>No Image</span>
              </div>
          }
          <div className="rc-img-overlay">
            <span className="rc-view-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              View Details
            </span>
          </div>
        </div>

        <div className="rc-body">
          <div className="rc-id-row">
            <span className="rc-id-label">MAT ID</span>
            <span className="rc-id-val">{material_id}</span>
          </div>
          {description && <p className="rc-desc">{description}</p>}
          <div className="rc-scores">
            <ScoreBar label="Score"  value={final_score}  color="amber" />
            <ScoreBar label="Visual" value={visual_score} color="teal"  />
            <ScoreBar label="Text"   value={text_score}   color="blue"  />
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="rcmod-overlay" onClick={() => setModal(false)}>
          <div className="rcmod" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="rcmod-hdr">
              <div>
                <div className="rcmod-eyebrow">PART DETAILS</div>
                <h2 className="rcmod-title">{material_id}</h2>
                {isTop && <span className="rcmod-best">★ Best Match</span>}
              </div>
              <button className="rcmod-close" onClick={() => setModal(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="rcmod-img-wrap">
              {!imgError
                ? <img src={imgSrc} alt={material_id} className="rcmod-img" onError={() => setImgError(true)} />
                : <div className="rcmod-img-err">No Image Available</div>
              }
            </div>

            {description && <p className="rcmod-desc">{description}</p>}

            {/* Scores */}
            <div className="rcmod-scores">
              <ScoreBar label="Overall Score"  value={final_score}  color="amber" />
              <ScoreBar label="Visual Score"   value={visual_score} color="teal"  />
              <ScoreBar label="Text Score"     value={text_score}   color="blue"  />
            </div>

            {/* Meta grid */}
            <div className="rcmod-meta">
              <MetaRow icon="◎" label="Rank"     value={`#${rank}`} />
              <MetaRow icon="◈" label="Material" value={material_id} />
              <MetaRow icon="⬡" label="Bin"      value={storage_bin} />
              <MetaRow icon="◈" label="Stock"    value={total_stock} />
              <MetaRow icon="◎" label="Plant"    value={plant} />
              <MetaRow icon="◷" label="Location" value={storage_location} />
              <MetaRow icon="◑" label="Duration" value={duration != null ? `${duration}y` : null} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}