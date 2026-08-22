import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User, Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { login, register, authModalOpen, setAuthModalOpen, showToast } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [travelStyle, setTravelStyle] = useState('Explorer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login({ email, password });
      } else if (tab === 'register') {
        await register({ name, email, password, travel_style: travelStyle });
      } else if (tab === 'forgot') {
        showToast('Password reset link sent to your email!', 'success');
        setTab('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail, presetPassword = 'password123') => {
    setError('');
    setLoading(true);
    try {
      await login({ email: presetEmail, password: presetPassword });
    } catch (err) {
      setError(`Quick login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to GlobeTrotter</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {tab === 'login' && 'Sign in to Your Account'}
            {tab === 'register' && 'Create Your Traveler Profile'}
            {tab === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'login' && 'Manage multi-city trips, budgets, & timelines.'}
            {tab === 'register' && 'Start personalizing your global adventures today.'}
            {tab === 'forgot' && 'Enter your registered email to receive a recovery link.'}
          </p>
        </div>

        {/* Preset Quick Logins */}
        {tab === 'login' && (
          <div className="mb-6 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              ⚡ Quick Demo Login (Click to Sign In)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('alex@globetrotter.com', 'password123')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/90 hover:bg-sky-600/20 hover:border-sky-500/40 border border-slate-700 text-xs font-medium text-slate-200 transition-all text-left"
              >
                <span className="text-base">🎒</span>
                <div>
                  <span className="block font-semibold">Alex Rivers</span>
                  <span className="block text-[10px] text-slate-400">Traveler</span>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('hbhalani937@gmail.com', 'Kano@5107')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-slate-700 text-xs font-medium text-slate-200 transition-all text-left"
              >
                <span className="text-base">🛡️</span>
                <div>
                  <span className="block font-semibold">hbhalani937</span>
                  <span className="block text-[10px] text-emerald-400">Admin</span>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('admin@globetrotter.com', 'password123')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-slate-700 text-xs font-medium text-slate-200 transition-all text-left"
              >
                <span className="text-base">👑</span>
                <div>
                  <span className="block font-semibold">admin</span>
                  <span className="block text-[10px] text-emerald-400">Admin</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab Toggle */}
        {tab !== 'forgot' && (
          <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivers"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="Explorer">Explorer & Nomad</option>
                <option value="Luxury">Luxury Traveler</option>
                <option value="Backpacker">Budget Backpacker</option>
                <option value="Culture & Photography">Culture & Photography</option>
                <option value="Adventure">Adventure Enthusiast</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>
              {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {tab === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setTab('login')}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
