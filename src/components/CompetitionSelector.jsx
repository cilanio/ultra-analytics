import { COMPETITIONS } from '../constants/competitions';

const ALL_OPTION = {
  id:    'all',
  name:  'Todos os Jogos',
  flag:  '📅',
  color: '#a3e635',
};

const OPTIONS = [ALL_OPTION, ...COMPETITIONS];

export default function CompetitionSelector({ competitionId, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '.375rem',
      marginBottom: '1.25rem',
      flexWrap: 'wrap',
    }}>
      {OPTIONS.map((c) => {
        const active = competitionId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              padding: '.4rem .875rem',
              borderRadius: '99px',
              border: `1px solid ${active ? c.color : 'var(--border)'}`,
              background: active ? `${c.color}18` : 'transparent',
              color: active ? c.color : 'var(--muted2)',
              fontFamily: "'Syne', sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
            {active && (
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: c.color,
                marginLeft: '.2rem',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}