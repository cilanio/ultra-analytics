import { useState } from 'react';
import { METRIC_KEYS, METRICS, METRIC_COLORS } from '../constants/metrics';

export default function ComparePanel({ multiKeys, onMultiChange, multiMode }) {
  const [open, setOpen] = useState(false);

  const handleChange = (idx, value) => {
    const next = multiKeys.map((k, i) => (i === idx ? value : k));
    onMultiChange(next);
  };

  const activeKeys = multiKeys.filter(Boolean);

  return (
    <>
      {multiMode && (
        <div style={{ marginBottom: '.75rem' }}>
          <div className="multi-active-badge">
            <span className="dot" />
            Multi-Métrica ativo · clique na lateral para voltar ao modo simples
          </div>
        </div>
      )}
      <div className="collapsible-panel">
        <div className="collapsible-header" onClick={() => setOpen((o) => !o)}>
          <div className="collapsible-title">
            <span className="c-dot" />
            Comparar Métricas
          </div>
          <span className={`collapsible-arrow${open ? ' open' : ''}`}>▼</span>
        </div>
        <div className={`collapsible-body${open ? ' open' : ''}`}>
          <div className="multi-inner">
            {[0, 1, 2, 3].map((idx) => {
              const val      = multiKeys[idx];
              const colorIdx = val ? activeKeys.indexOf(val) : -1;
              const lineColor = colorIdx >= 0 ? METRIC_COLORS[colorIdx] : undefined;
              return (
                <div
                  key={idx}
                  className="filter-group"
                  style={lineColor ? { borderColor: lineColor, boxShadow: `inset 0 0 0 1px ${lineColor}22` } : {}}
                >
                  <label className="filter-lbl" style={lineColor ? { color: lineColor } : {}}>
                    Métrica {idx + 1}
                  </label>
                  <select
                    className="main-sel"
                    value={val}
                    style={lineColor ? { color: lineColor } : {}}
                    onChange={(e) => handleChange(idx, e.target.value)}
                  >
                    <option value="">— nenhuma —</option>
                    {METRIC_KEYS.map((k) => (
                      <option key={k} value={k}>{METRICS[k]}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}