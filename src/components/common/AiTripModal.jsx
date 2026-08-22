import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Sparkles, X, Wand2, Calendar, DollarSign, ArrowRight, Compass } from 'lucide-react';

export default function AiTripModal({ open, onClose }) {
  const { user, navigateTo, showToast, setAuthModalOpen } = useAuth();

  const [vibe, setVibe] = useState('Romantic Escape');
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState(2000);
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      setAuthModalOpen(true);
      showToast('Please sign in to generate AI trips!', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await api.generateAiTrip({
        userId: user.id,
        vibe,
        duration_days: duration,
        target_budget: budget,
        custom_prompt: promptText,
      });

      showToast(`✨ AI Generated "${res.title}" successfully!`, 'success');
      onClose();
      navigateTo('itinerary-builder', { tripId: res.trip_id });
    } catch (err) {
      console.error('AI Generate Error:', err);
      showToast('AI Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const vibes = [
    { label: 'Romantic Escape', emoji: '💕' },
    { label: 'Adventure & Thrill', emoji: '🌋' },
    { label: 'Budget Backpacker', emoji: '🎒' },
    { label: 'Luxury & Wellness', emoji: '✨' },
    { label: 'Culture & Food Tour', emoji: '🍜' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
            <span>AI Travel Assistant</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Instant AI Itinerary Generator</h2>
          <p className="text-xs text-slate-400">Describe your dream travel vibe and let AI build your multi-city route, activities, and budget.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          
          {/* Custom Prompt Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Custom Wish / Prompt (Optional)
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. 7 days exploring European architecture & Michelin pasta..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Vibe Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Trip Vibe & Style
            </label>
            <div className="flex flex-wrap gap-2">
              {vibes.map((v) => (
                <button
                  type="button"
                  key={v.label}
                  onClick={() => setVibe(v.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    vibe === v.label
                      ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white border-sky-400 shadow-md scale-105'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>{v.emoji} {v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Duration</span>
                <span className="text-sky-400">{duration} Days</span>
              </div>
              <input
                type="range"
                min="3"
                max="14"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Budget</span>
                <span className="text-emerald-400">${budget}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-emerald-500 to-indigo-600 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Wand2 className="w-5 h-5 animate-pulse" />
            <span>{loading ? 'AI Crafting Your Itinerary...' : 'Generate AI Itinerary Now'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
