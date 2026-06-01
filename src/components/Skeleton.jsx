function SkeletonBlock({ width = '100%', height = '1rem', radius = '.5rem', style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Filters row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '.625rem', marginBottom: '1.25rem' }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonBlock key={i} height='3.2rem' radius='.875rem' />
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: '1.25rem' }}>
        {/* Chart panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <SkeletonBlock width='120px' height='.625rem' />
              <SkeletonBlock width='200px' height='1.1rem' />
              <SkeletonBlock width='160px' height='1.5rem' radius='99px' />
            </div>
            <div style={{ display: 'flex', gap: '.875rem', alignItems: 'center' }}>
              {[...Array(3)].map((_, i) => (
                <SkeletonBlock key={i} width='48px' height='2rem' radius='.5rem' />
              ))}
            </div>
          </div>
          <SkeletonBlock height='320px' radius='1rem' />
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '.875rem' }}>
            {[...Array(5)].map((_, i) => (
              <SkeletonBlock key={i} width='80px' height='.75rem' />
            ))}
          </div>
        </div>

        {/* Metrics panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '1.25rem' }}>
          <SkeletonBlock height='.625rem' width='60%' style={{ marginBottom: '.75rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
            {[...Array(10)].map((_, i) => (
              <SkeletonBlock key={i} height='3rem' radius='.5rem' />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}