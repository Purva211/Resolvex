import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <Logo size="lg" />
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Register as a customer to file & manage complaints</p>
        </div>

        {error && (
          <div className="error-card mb-4">
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <div className="input-field-group">
              <User size={16} className="input-icon-left" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Email address</label>
            <div className="input-field-group">
              <Mail size={16} className="input-icon-left" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="input-field-group">
              <Lock size={16} className="input-icon-left" />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="•••••••• (6+ characters)"
                className="input-field text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Creating Account...' : 'Create Customer Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="auth-footer text-center pt-4 border-t border-slate-100 mt-4">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
