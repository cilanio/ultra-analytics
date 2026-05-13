export default function MetricsList({ statsA, statsB, activeMetric, onSelectMetric }) {
  const maxA   = Math.max(...statsA.map((s) => s.avg), 0.01);
  const maxAll = Math.max(maxA, statsB ? Math.max(...statsB.map((s) => s.avg), 0.01) : maxA);
  return (
    <div className="metrics-panel">
      <div className="metrics-title">Métricas · toque para detalhar</div>
      <div className="metrics-list">
        {statsA.map((sA) => {
          const sB  = statsB ? statsB.find((s) => s.key === sA.key) : null;
          const act = sA.key === activeMetric;
          return (
            <div
              key={sA.key}
              className={`metric-item${act ? ' active' : ''}`}
              onClick={() => onSelectMetric(sA.key)}
            >
              <div className="metric-top">
                <span className="metric-name">{sA.label}</span>
                <div className="metric-vals">
                  <span className="mv a">{sA.avg}</span>
                  {sB && <><span className="mv-sep">/</span><span className="mv b">{sB.avg}</span></>}
                </div>
              </div>
              <div className="metric-bars">
                <div style={{ display: 'flex', gap: '.4rem' }}>
                  <div className="bar-bg">
                    <div className="bar-fill a" style={{ width: `${(sA.avg / maxAll * 100).toFixed(1)}%` }} />
                  </div>
                </div>
                {sB && (
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <div className="bar-bg">
                      <div className="bar-fill b" style={{ width: `${(sB.avg / maxAll * 100).toFixed(1)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}