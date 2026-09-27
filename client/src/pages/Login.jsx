import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function Login() {
  const [email, setEmail] = useState('customer@resolvex.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(demoEmail) {
    setEmail(demoEmail);
    setPassword('123456');
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <Logo size="lg" />
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your complaint support portal</p>
        </div>

        {error && (
          <div className="error-card mb-4">
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Email address</label>
            <div className="input-field-group">
              <Mail size={16} className="input-icon-left" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="demo-accounts-box mt-6">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Quick Demo Quick-fill</span>
          <div className="flex flex-wrap gap-1.5">
            <button 
              type="button" 
              onClick={() => handleDemoLogin('customer@resolvex.com')}
              className="demo-chip"
            >
              Customer
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('rahul@resolvex.com')}
              className="demo-chip"
            >
              Agent (Rahul)
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('admin@resolvex.com')}
              className="demo-chip"
            >
              Admin
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1.5">Demo password: 123456</span>
        </div>

        <div className="auth-footer text-center pt-4 border-t border-slate-100 mt-4">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
