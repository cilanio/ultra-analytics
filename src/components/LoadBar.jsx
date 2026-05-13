export default function LoadBar({ status }) {
  const width = status === 'loading' ? '60%' : status === 'live' ? '100%' : '0%';
  return (
    <div
      className="load-bar"
      style={{ width, opacity: status === 'live' ? 0 : 1, transition: 'width .4s, opacity .6s' }}
    />
  );
}