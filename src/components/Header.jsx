export default function Header({ status, message, onSignOut }) {
  return (
    <header>
      <div>
        <div className="brand-tag">Ultra Analytics · Série A</div>
        <h1>Match <span>Intelligence</span></h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="data-status">
          <span className={`dot${status === 'live' ? ' live' : status === 'error' ? ' err' : ''}`} />
          <span>{message}</span>
        </div>
        {onSignOut && (
          <button className="export-btn" onClick={onSignOut}>
            Sair
          </button>
        )}
      </div>
    </header>
  );
}