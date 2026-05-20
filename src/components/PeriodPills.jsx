const PERIODS = [
  { value: 'FT', label: 'Jogo Todo' },
  { value: 'HT', label: '1º Tempo'  },
  { value: '2T', label: '2º Tempo'  },
];

export default function PeriodPills({ activePeriod, onSetPeriod, disableSubPeriods }) {
  return (
    <div className="period-pills">
      {PERIODS.map(({ value, label }) => {
        const isDisabled = disableSubPeriods && value !== 'FT';
        return (
          <div
            key={value}
            className={`ppill${activePeriod === value && !isDisabled ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
            style={isDisabled ? { opacity: 0.35, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
            onClick={() => !isDisabled && onSetPeriod(value)}
            title={isDisabled ? 'Disponível apenas para Jogo Todo' : undefined}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}