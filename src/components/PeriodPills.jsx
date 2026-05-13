const PERIODS = [
  { value: 'FT', label: 'Jogo Todo' },
  { value: 'HT', label: '1º Tempo'  },
  { value: '2T', label: '2º Tempo'  },
];

export default function PeriodPills({ activePeriod, onSetPeriod }) {
  return (
    <div className="period-pills">
      {PERIODS.map(({ value, label }) => (
        <div
          key={value}
          className={`ppill${activePeriod === value ? ' active' : ''}`}
          onClick={() => onSetPeriod(value)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}