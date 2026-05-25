import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '1.5rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '1.5rem', padding: '2.5rem',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#63b3ed', marginBottom: '.3rem' }}>
            Ultra Analytics · Série A
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.02em', color: '#fff' }}>
            Match <span style={{ color: 'var(--muted)' }}>Intelligence</span>
          </h1>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '.75rem', padding: '4px', marginBottom: '1.5rem' }}>
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '.5rem', border: 'none', borderRadius: '.6rem', cursor: 'pointer',
                fontFamily: "'Syne',sans-serif", fontSize: '11px', fontWeight: 700,
                letterSpacing: '.1em', textTransform: 'uppercase', transition: 'all .2s',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--muted2)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: "'Syne',sans-serif", fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted2)', display: 'block', marginBottom: '.3rem' }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="seu@email.com"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '.75rem', padding: '.75rem 1rem', color: '#fff',
              fontFamily: "'DM Sans',sans-serif", fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontFamily: "'Syne',sans-serif", fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted2)', display: 'block', marginBottom: '.3rem' }}>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '.75rem', padding: '.75rem 1rem', color: '#fff',
              fontFamily: "'DM Sans',sans-serif", fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: 'rgba(252,129,129,.1)', border: '1px solid rgba(252,129,129,.3)', borderRadius: '.75rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '13px', color: 'var(--bad)' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(72,187,120,.1)', border: '1px solid rgba(72,187,120,.3)', borderRadius: '.75rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '13px', color: 'var(--good)' }}>
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: '100%', padding: '.875rem', border: 'none', borderRadius: '.875rem',
            background: loading || !email || !password ? 'var(--muted)' : '#63b3ed',
            color: '#fff', fontFamily: "'Syne',sans-serif", fontSize: '12px',
            fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            transition: 'background .2s',
          }}
        >
          {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}