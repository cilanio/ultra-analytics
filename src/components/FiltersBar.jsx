const N_OPTIONS = [5, 8, 10, 15, 999];

export default function FiltersBar({ lastN, onSetN, onExportPNG, onExportCSV }) {
  return (
    <div className="shared-filters">
      <div className="sf-card">
        <span className="sf-lbl">Últimas</span>
        <div className="n-pills">
          {N_OPTIONS.map((n) => (
            <div
              key={n}
              className={`npill${lastN === n ? ' active' : ''}`}
              onClick={() => onSetN(n)}
            >
              {n >= 999 ? 'Todas' : n}
            </div>
          ))}
        </div>
      </div>
      <button className="export-btn" onClick={onExportPNG}>
        <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        PNG
      </button>
      <button className="export-btn" onClick={onExportCSV}>
        <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        CSV
      </button>
    </div>
  );
}