import { useState } from 'react';
import { METRIC_KEYS } from '../constants/metrics';

export default function MetricsList({ statsA, statsB, activeMetric, onSelectMetric }) {
  // Visibility state per metric key — all visible by default
  const [hidden, setHidden] = useState(() => new Set());

  const toggleHidden = (e, key) => {
    e.stopPropagation(); // don't trigger metric selection
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const maxA   = Math.max(...statsA.map((s) => s.avg), 0.01);
  const maxAll = Math.max(maxA, statsB ? Math.max(...statsB.map((s) => s.avg), 0.01) : maxA);

  return (
    <div className="metrics-panel">
      <div className="metrics-title">Métricas · toque para detalhar</div>
      <div className="metrics-list">
        {statsA.map((sA) => {
          if (hidden.has(sA.key)) {
            // Render collapsed/hidden row — just label + eye icon to restore
            return (
              <div
                key={sA.key}
                className="metric-item"
                style={{ opacity: 0.35 }}
                onClick={() => onSelectMetric(sA.key)}
              >
                <div className="metric-top">
                  <span className="metric-name">{sA.label}</span>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', fontSize: '10px', padding: 0 }}
                    onClick={(e) => toggleHidden(e, sA.key)}
                    title="Mostrar métrica"
                  >
                    👁
                  </button>
                </div>
              </div>
            );
          }

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
                <div className="metric-vals" style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                  <span className="mv a">{sA.avg}</span>
                  {sB && <><span className="mv-sep">/</span><span className="mv b">{sB.avg}</span></>}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '9px', padding: '0 0 0 4px', lineHeight: 1 }}
                    onClick={(e) => toggleHidden(e, sA.key)}
                    title="Ocultar métrica"
                  >
                    ✕
                  </button>
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