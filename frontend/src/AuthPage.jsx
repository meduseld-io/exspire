import { useState, useEffect } from 'react';
import { signup, login, forgotPassword, resetPassword, verifyEmail } from './api.js';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Check URL params for reset token or verify token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset');
    const verify = params.get('verify');
    if (reset) {
      setResetToken(reset);
      setMode('reset');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (verify) {
      window.history.replaceState({}, '', window.location.pathname);
      verifyEmail(verify)
        .then(() => setSuccess('Email verified. You can now sign in.'))
        .catch(err => {
          console.error('Email verification failed:', err);
          setError(err.message);
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signup(email, password, displayName);
        localStorage.setItem('exspire_token', data.token);
        onAuth(data.user, true);
      } else if (mode === 'login') {
        const data = await login(email, password);
        localStorage.setItem('exspire_token', data.token);
        onAuth(data.user, false);
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setSuccess('If an account exists with that email, a reset link has been sent.');
      } else if (mode === 'reset') {
        await resetPassword(resetToken, password);
        setSuccess('Password reset. You can now sign in.');
        setMode('login');
      }
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
    setSuccess('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
          <span className="app-title">ExSpire</span>
        </div>
        <p className="auth-subtitle">
          {mode === 'login' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'reset' && 'Set a new password'}
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

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
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
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div className="auth-field">
              <label>{mode === 'reset' ? 'New password' : 'Password'}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : {
              login: 'Sign in',
              signup: 'Create account',
              forgot: 'Send reset link',
              reset: 'Set new password',
            }[mode]}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <button className="auth-forgot-btn" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <button className="auth-switch-btn" onClick={() => switchMode('signup')}>Sign up</button>
            </p>
          </>
        )}
        {mode === 'signup' && (
          <p className="auth-switch">
            Already have an account?{' '}
            <button className="auth-switch-btn" onClick={() => switchMode('login')}>Sign in</button>
          </p>
        )}
        {mode === 'forgot' && (
          <p className="auth-switch">
            <button className="auth-switch-btn" onClick={() => switchMode('login')}>Back to sign in</button>
          </p>
        )}
        {mode === 'reset' && (
          <p className="auth-switch">
            <button className="auth-switch-btn" onClick={() => switchMode('login')}>Back to sign in</button>
          </p>
        )}

        <p className="auth-copyright">
          &copy; {new Date().getFullYear()} <a href="https://github.com/meduseld-io" target="_blank" rel="noopener noreferrer">meduseld.io</a>
        </p>
      </div>
    </div>
  );
}
