import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

// Floating particles
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
        <div
          key={p.id}
          className="particle"
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

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;
    if (!name.trim() || !email.trim() || !password.trim())
      return setError('All fields are required');
    if (password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await api.post('/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="bg-aurora" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-noise" />

      <div className="auth-page">
        <Particles />

        <div className="auth-container">
          {/* Logo */}
          <div className="auth-logo">
            <div className="logo-ring">
              <div className="logo-inner">🔍</div>
            </div>
            <h1 className="gradient-text">Lost &amp; Found</h1>
            <p>Campus Item Management System</p>
          </div>

          {/* Card */}
          <div className="auth-card">
            <h2>Create Account</h2>
            <p className="auth-subtitle">
              Join the campus network — report and find lost items
            </p>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-wrap">
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    className="with-icon"
                    placeholder="e.g. Ansh Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-wrap">
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    className="with-icon"
                    placeholder="e.g. ansh@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <span className="input-icon">✉️</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrap">
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    className="with-icon"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
                disabled={loading}
              >
                {!loading && '🚀 Create Account'}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <div className="auth-link">
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
