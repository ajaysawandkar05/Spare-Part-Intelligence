// ResultsGrid.jsx
import ResultCard from "./ResultCard";

export default function ResultsGrid({ results, loading }) {
  if (loading) {
    return (
      <div className="rg-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rg-skel" aria-busy="true">
            <div className="rg-skel-img" />
            <div className="rg-skel-body">
              <div className="rg-skel-line rg-skel-line--wide" />
              <div className="rg-skel-line" />
              <div className="rg-skel-line rg-skel-line--short" />
            </div>
          </div>
        ))}
        <div className="rg-loading-label" role="status" aria-live="polite">
          <span className="rg-loading-spinner" />
          Scanning inventory…
        </div>
      </div>
    );
  }
  if (!results.length) return null;
  return (
    <div className="results-section">
      <div className="rg-header">
        <h2 className="rg-title">MATCHING PARTS</h2>
        <span className="rg-count">{results.length} results found</span>
      </div>
      <div className="rg-grid">
        {results.map(r => <ResultCard key={r.material_id} result={r} isTop={r.rank === 1} />)}
      </div>
    </div>
  );
}