export default function Header({ status, message }) {
  return (
    <header>
      <div>
        <div className="brand-tag">Ultra Analytics · Série A</div>
        <h1>Match <span>Intelligence</span></h1>
      </div>
      <div className="data-status">
        <span className={`dot${status === 'live' ? ' live' : status === 'error' ? ' err' : ''}`} />
        <span>{message}</span>
      </div>
    </header>
  );
}