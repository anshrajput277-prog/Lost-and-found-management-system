import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: Math.random() * 10 + 12,
    color: ['#6366f1','#8b5cf6','#06b6d4','#ec4899','#10b981'][Math.floor(Math.random() * 5)],
  }));
  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="particle"
          style={{
            width: p.size, height: p.size,
            left: `${p.left}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim())
      return setError('Email and password are required');

    setLoading(true);
    try {
      const res = await api.post('/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-noise" />

      <div className="auth-page">
        <Particles />

        <div className="auth-container">
          <div className="auth-logo">
            <div className="logo-ring">
              <div className="logo-inner">🔍</div>
            </div>
            <h1 className="gradient-text">Lost &amp; Found</h1>
            <p>Campus Item Management System</p>
          </div>

          <div className="auth-card">
            <h2>Welcome Back 👋</h2>
            <p className="auth-subtitle">Sign in to access the campus portal</p>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrap">
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    className="with-icon"
                    placeholder="Enter your college email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <span className="input-icon">✉️</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrap">
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    className="with-icon"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
                disabled={loading}
              >
                {!loading && '🔐 Sign In'}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <div className="auth-link">
              Don't have an account?{' '}
              <Link to="/register">Register now</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
