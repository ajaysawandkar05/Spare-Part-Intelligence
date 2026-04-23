import { useState, useCallback } from "react";
import SearchPanel from "./SearchPanel";
import ResultsGrid from "./ResultsGrid";
import StatsBar from "./StatsBar";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "/";

export default function PartFinderPage() {
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [queryMode, setQueryMode] = useState(null);
  const [error, setError]         = useState(null);
  const [queryImage, setQueryImage] = useState(null);
  const navigate = useNavigate();

  const handleSearch = useCallback(async ({ image, text, visualWeight, textWeight, topK, filterPartType }) => {
    if (!image && !text.trim()) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (image) { fd.append("image", image); setQueryImage(URL.createObjectURL(image)); }
    else setQueryImage(null);
    if (text) fd.append("text", text);
    fd.append("top_k", topK);
    fd.append("visual_weight", visualWeight);
    fd.append("text_weight", textWeight);
    if (filterPartType) fd.append("filter_part_type", filterPartType);
    try {
      const res = await fetch(`${API}api/query`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResults(data.results);
      setQueryMode(data.query_mode);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="finder-page">
      {/* Breadcrumb */}
      <div className="finder-breadcrumb">
        <button className="finder-back" onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          HOME
        </button>
        <span className="finder-bc-sep">›</span>
        <span className="finder-bc-cur">Spare Part Recognition</span>
      </div>

      {/* Page header */}
      <div className="finder-header">
        <div className="finder-header-left">
          <p className="finder-eyebrow">AI-POWERED SEARCH</p>
          <h1 className="finder-h1">Spare Part Recognition</h1>
          <p className="finder-sub">Upload an image, enter a description, or combine both to identify spare parts from your inventory.</p>
        </div>
        <div className="finder-header-right">
          <div className="finder-status-grid">
          </div>
        </div>
      </div>

      <div className="finder-divider" />

      {/* Search panel */}
      <SearchPanel onSearch={handleSearch} loading={loading} />

      {/* Error */}
      {error && (
        <div className="finder-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      {(results.length > 0 || loading) && (
        <StatsBar results={results} queryMode={queryMode} queryImage={queryImage} loading={loading} />
      )}

      {/* Results */}
      <ResultsGrid results={results} loading={loading} />

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="finder-empty">
          <div className="finder-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className="finder-empty-title">Ready to search</p>
          <p className="finder-empty-sub">Upload an image or enter a description above, then click <b>Find Matching Parts</b></p>
        </div>
      )}
    </div>
  );
}