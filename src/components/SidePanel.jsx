import { useState } from 'react';

const LINE_TOGGLES = [
  { id: 0, label: 'Realizado',   color: '#63b3ed' },
  { id: 1, label: 'Méd. Móvel', color: '#f6ad55' },
  { id: 2, label: 'Méd. Geral', color: '#94a3b8' },
  { id: 3, label: 'Máximo',     color: '#FF3877' },
  { id: 4, label: 'Mínimo',     color: '#ffff00' },
  { id: 5, label: 'Total Jogo', color: '#a3e635' },
];

export default function SidePanel({ onToggleLine, onToggleResult, showLineToggles = true }) {
  const [linesOpen,   setLinesOpen]   = useState(true);
  const [resultOpen,  setResultOpen]  = useState(true); // starts open
  const [lineChecked, setLineChecked] = useState(() => LINE_TOGGLES.map(() => true));
  const [resultOn,    setResultOn]    = useState(false);

  const handleLineChange = (idx) => {
    const next = lineChecked.map((v, i) => (i === idx ? !v : v));
    setLineChecked(next);
    onToggleLine(idx, next[idx]);
  };

  const handleResultChange = (checked) => {
    setResultOn(checked);
    onToggleResult(checked);
  };

  return (
    <div className="side-panel">
      {/* LINES — only shown in single metric mode */}
      {showLineToggles && (
        <div className="side-block">
          <div className="side-block-header" onClick={() => setLinesOpen((o) => !o)}>
            <span className="side-block-title">Linhas</span>
            <span className={`side-block-arrow${linesOpen ? ' open' : ''}`}>▼</span>
          </div>
          <div className={`side-block-body${linesOpen ? ' open' : ''}`}>
            {LINE_TOGGLES.map(({ id, label, color }) => (
              <label key={id} className="toggle-row">
                <input
                  type="checkbox"
                  checked={lineChecked[id]}
                  style={{ color }}
                  onChange={() => handleLineChange(id)}
                />
                <span className="toggle-label">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS — always shown */}
      <div className="side-block">
        <div className="side-block-header" onClick={() => setResultOpen((o) => !o)}>
          <span className="side-block-title">Resultados</span>
          <span className={`side-block-arrow${resultOpen ? ' open' : ''}`}>▼</span>
        </div>
        <div className={`side-block-body${resultOpen ? ' open' : ''}`}>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={resultOn}
              style={{ color: '#a3e635' }}
              onChange={(e) => handleResultChange(e.target.checked)}
            />
            <span className="toggle-label">Colorir por resultado</span>
          </label>
          <div className="result-legend">
            <div className="rleg-row"><div className="rleg-dot" style={{ background: '#00e676' }} />Vitória</div>
            <div className="rleg-row"><div className="rleg-dot" style={{ background: '#cfd8dc' }} />Empate</div>
            <div className="rleg-row"><div className="rleg-dot" style={{ background: '#fc8181' }} />Derrota</div>
          </div>
        </div>
      </div>
    </div>
  );
}