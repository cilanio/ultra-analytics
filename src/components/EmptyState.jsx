export default function EmptyState({ status }) {
  const isError = status === 'error';
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <svg
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={isError ? {} : { animation: 'spin 1.2s linear infinite' }}
        >
          {isError ? (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          ) : (
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          )}
        </svg>
      </div>
      <div>
        <div className="empty-title">
          {isError ? 'Erro ao carregar' : 'Carregando dados…'}
        </div>
        <div className="empty-sub">
          {isError
            ? 'Verifique a conexão com a planilha.'
            : 'Buscando estatísticas do Brasileirão 2026.'}
        </div>
      </div>
    </div>
  );
}