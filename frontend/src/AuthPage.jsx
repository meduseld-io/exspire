import { useState } from 'react';

export default function AuthPage({ auth, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await auth.signupInline(email, password, displayName);
      } else {
        await auth.loginInline(email, password);
      }
      onAuth(auth.getUser());
    } catch (err) {
      console.error(`${mode} failed:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
          <span className="app-title">ExSpire</span>
        </div>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in with your Meduseld Account' : 'Create a Meduseld Account'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label>Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <a
              className="auth-forgot-btn"
              href="https://accounts.meduseld.io?redirect=https://exspire.meduseld.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Forgot password?
            </a>
            <p className="auth-switch">
              No account?{' '}
              <button className="auth-switch-btn" onClick={() => switchMode('signup')}>Create one</button>
            </p>
          </>
        )}
        {mode === 'signup' && (
          <p className="auth-switch">
            Already have an account?{' '}
            <button className="auth-switch-btn" onClick={() => switchMode('login')}>Sign in</button>
          </p>
        )}

        <p className="auth-branding">
          Powered by <a href="https://accounts.meduseld.io" target="_blank" rel="noopener noreferrer">Meduseld Account</a>
        </p>

        <p className="auth-copyright">
          &copy; {new Date().getFullYear()} <a href="https://github.com/meduseld-io" target="_blank" rel="noopener noreferrer">meduseld.io</a>
        </p>
      </div>
    </div>
  );
}
