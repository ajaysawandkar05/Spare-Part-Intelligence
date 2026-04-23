const MODE_LABELS = {
  multimodal: "Multi-Modal",
  visual:     "Visual Only",
  text:       "Text Only",
};

const MODE_COLORS = {
  multimodal: "var(--amber)",
  visual:     "var(--blue)",
  text:       "var(--teal)",
};

export default function StatsBar({ results, queryMode, queryImage, loading }) {
  const topScore = results[0]?.final_score ?? 0;
  const avgScore = results.length
    ? (results.reduce((s, r) => s + r.final_score, 0) / results.length).toFixed(3) : 0;

  return (
    <div className="sb-wrap">
      {queryImage && (
        <div className="sb-query-img">
          <img src={queryImage} alt="Query" className="sb-qimg" />
          <span className="sb-qimg-label">QUERY</span>
        </div>
      )}

      <div className="sb-divider" />

      <div className="sb-stats">
        <div className="sb-stat">
          <span className="sb-stat-label">MATCHES</span>
          <span className="sb-stat-val">{loading ? "—" : results.length}</span>
        </div>
        <div className="sb-stat">
          <span className="sb-stat-label">TOP SCORE</span>
          <span className="sb-stat-val sb-stat-val--amber">{loading ? "—" : topScore.toFixed(3)}</span>
        </div>
        <div className="sb-stat">
          <span className="sb-stat-label">AVG SCORE</span>
          <span className="sb-stat-val">{loading ? "—" : avgScore}</span>
        </div>
        <div className="sb-stat">
          <span className="sb-stat-label">MODE</span>
          <span className="sb-stat-val sb-stat-val--mode"
            style={{ color: queryMode ? MODE_COLORS[queryMode] : "var(--text-2)" }}>
            {queryMode ? MODE_LABELS[queryMode] : "—"}
          </span>
        </div>
      </div>

      <div className="sb-divider" />

      <div className="sb-bar-wrap">
        {results.slice(0, 5).map((r, i) => (
          <div className="sb-mini-bar" key={r.material_id} title={`${r.material_id}: ${r.final_score.toFixed(3)}`}>
            <div className="sb-mini-fill" style={{ height: `${r.final_score * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}