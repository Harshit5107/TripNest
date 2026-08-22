import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Globe3D from '../3d/Globe3D';
import { Compass, Plus, MapPin, Calendar, DollarSign, ArrowRight, Star, TrendingUp, ShieldCheck, Sparkles, Heart, Wand2, Bot } from 'lucide-react';

export default function DashboardView() {
  const { user, navigateTo, setAuthModalOpen, showToast } = useAuth();
  const [popularCities, setPopularCities] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Generator Inline Widget State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiVibe, setAiVibe] = useState('Romantic Escape');
  const [aiDays, setAiDays] = useState(7);
  const [aiBudget, setAiBudget] = useState(2000);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const cities = await api.getCities({ userId: user?.id });
        setPopularCities(cities.slice(0, 6));

        if (user) {
          const trips = await api.getUserTrips(user.id);
          setRecentTrips(trips);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const handleGlobeSelectCity = (cityName) => {
    const matched = popularCities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (matched) {
      showToast(`Selected ${matched.name}, ${matched.country} on 3D Globe!`, 'info');
      navigateTo('city-search', { search: matched.name });
    }
  };

  const handleInlineAiGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in to generate AI itineraries!', 'info');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await api.generateAiTrip({
        userId: user.id,
        vibe: aiVibe,
        duration_days: aiDays,
        target_budget: aiBudget,
        custom_prompt: aiPrompt,
      });

      showToast(`✨ AI Generated "${res.title}" successfully!`, 'success');
      navigateTo('itinerary-builder', { tripId: res.trip_id });
    } catch (err) {
      console.error('Inline AI Error:', err);
      showToast('Failed to generate AI trip', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      
      {/* Hero Header & 3D Globe Section */}
      <section className="relative overflow-hidden pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Text & AI Widget */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Next-Gen AI Personalized Travel Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Dream, Plan & Explore <br />
              <span className="bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
                Without Limits
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Build seamless multi-city itineraries, generate custom AI trips instantly, estimate exact travel budgets, and explore 3D world destinations.
            </p>

            {/* AI Trip Assistant Card Widget */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-sky-500/30 backdrop-blur-xl shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-extrabold text-white">AI Trip Assistant</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Instant Generator
                </span>
              </div>

              <form onSubmit={handleInlineAiGenerate} className="space-y-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 7 days romantic European honeymoon under $2000..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <select
                    value={aiVibe}
                    onChange={(e) => setAiVibe(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="Romantic Escape">💕 Romantic</option>
                    <option value="Adventure & Thrill">🌋 Adventure</option>
                    <option value="Budget Backpacker">🎒 Backpacker</option>
                    <option value="Luxury & Wellness">✨ Luxury</option>
                    <option value="Culture & Food Tour">🍜 Food & Culture</option>
                  </select>

                  <select
                    value={aiDays}
                    onChange={(e) => setAiDays(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="10">10 Days</option>
                    <option value="14">14 Days</option>
                  </select>

                  <select
                    value={aiBudget}
                    onChange={(e) => setAiBudget(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="1200">$1,200</option>
                    <option value="2000">$2,000</option>
                    <option value="3500">$3,500</option>
                    <option value="5000">$5,000</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-indigo-600 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all"
                >
                  <Wand2 className="w-4 h-4 animate-pulse" />
                  <span>{aiGenerating ? 'AI Crafting Itinerary...' : 'Auto-Generate AI Trip'}</span>
                </button>
              </form>
            </div>

            {/* Key Quick Stats Counter */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 max-w-lg">
              <div>
                <span className="block text-2xl font-black text-white">66+</span>
                <span className="block text-xs text-slate-400">Global Cities</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-400">100%</span>
                <span className="block text-xs text-slate-400">MySQL Database</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-sky-400">AI</span>
                <span className="block text-xs text-slate-400">Trip Generator</span>
              </div>
            </div>
          </div>

          {/* Right 3D Globe Component */}
          <div className="lg:col-span-6">
            <Globe3D onSelectCity={handleGlobeSelectCity} />
          </div>

        </div>
      </section>

      {/* User Recent Trips Section */}
      {user && recentTrips.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Your Upcoming Journeys</h2>
              <p className="text-xs text-slate-400">Quickly access and build your ongoing trip plans</p>
            </div>
            <button
              onClick={() => navigateTo('my-trips')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>View All ({recentTrips.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => navigateTo('itinerary-view', { tripId: trip.id })}
                className="group cursor-pointer glass-panel glass-panel-hover rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden"
              >
                <div className="h-40 rounded-2xl overflow-hidden relative">
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    {trip.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{trip.stop_count} Cities</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>${trip.target_budget}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Destinations Carousel Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Worldwide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Popular Destinations</h2>
          </div>
          <button
            onClick={() => navigateTo('city-search')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
          >
            <span>See All Cities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCities.map((city) => (
            <div
              key={city.id}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-slate-800/80 group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Cost badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-xs font-bold text-sky-400 border border-slate-700">
                  {city.cost_index} • ${city.avg_cost_per_day}/day
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{city.popularity_rating}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                    {city.country} • {city.region}
                  </span>
                  <h3 className="text-xl font-black text-white">{city.name}</h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Safety Score: {city.safety_index}/100</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) setAuthModalOpen(true);
                      else navigateTo('create-trip', { cityId: city.id });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white text-xs font-bold transition-all border border-sky-500/30"
                  >
                    + Add to Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
