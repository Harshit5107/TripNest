import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Calendar, DollarSign, Image, Globe, ArrowRight, Lock, Eye, Sparkles } from 'lucide-react';

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80', // Paris
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80', // Tokyo
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80', // Rome
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80', // Bali
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80', // NY
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80', // Sydney
];

export default function CreateTripModal() {
  const { user, navigateTo, showToast, selectedCityId } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-10');
  const [targetBudget, setTargetBudget] = useState(2000);
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0]);
  const [visibility, setVisibility] = useState('public');
  
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await api.getCities();
        setAvailableCities(cities);

        if (selectedCityId) {
          const match = cities.find(c => c.id === Number(selectedCityId));
          if (match) setSelectedCities([match.id]);
        } else if (cities.length >= 2) {
          setSelectedCities([cities[0].id, cities[1].id]);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCities();
  }, [selectedCityId]);

  const toggleCity = (cityId) => {
    if (selectedCities.includes(cityId)) {
      setSelectedCities(selectedCities.filter(id => id !== cityId));
    } else {
      setSelectedCities([...selectedCities, cityId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to create trips.', 'warning');
      return;
    }

    if (!title || !startDate || !endDate) {
      showToast('Trip title, start date, and end date are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const createdTrip = await api.createTrip({
        user_id: user.id,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        target_budget: parseFloat(targetBudget),
        cover_image: coverImage,
        visibility,
        selected_city_ids: selectedCities,
      });

      showToast('Trip created successfully! Now building itinerary...', 'success');
      navigateTo('itinerary-builder', { tripId: createdTrip.id });
    } catch (err) {
      console.error('Create trip error:', err);
      showToast(err.message || 'Failed to create trip', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Step 1: Initiation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Create New Travel Plan</h1>
        <p className="text-sm text-slate-400">Set your trip dates, budget targets, cover photo, and initial city stops.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-2xl">
        
        {/* Basic Trip Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trip Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Euro Gateway: Paris & Rome Adventure"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-base text-white focus:outline-none focus:border-sky-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-sky-400" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-emerald-400" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target Budget ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-amber-400" />
              <input
                type="number"
                min="100"
                step="50"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="2000"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Visibility & Sharing
            </label>
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  visibility === 'public' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Public (Sharable Link)</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  visibility === 'private' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Private Only</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trip Description & Overview
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals of this journey? Write notes about travel mates, preferences, or dream activities..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>

        {/* Initial Destination City Multi-Selector */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Initial Destination City Stops ({selectedCities.length} Selected)
            </label>
            <span className="text-xs text-slate-400">You can add/reorder more cities later</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {availableCities.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              return (
                <div
                  key={city.id}
                  onClick={() => toggleCity(city.id)}
                  className={`cursor-pointer p-3 rounded-2xl border text-xs font-semibold flex items-center space-x-2.5 transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <img src={city.image_url} alt={city.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="truncate">
                    <span className="block font-bold truncate">{city.name}</span>
                    <span className="block text-[10px] text-slate-400">{city.country}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cover Photo Presets */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Choose Cover Banner Image
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {COVER_PRESETS.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setCoverImage(imgUrl)}
                className={`h-20 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                  coverImage === imgUrl ? 'border-sky-500 scale-105 shadow-lg shadow-sky-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 transition-all"
          >
            <span>{loading ? 'Creating Trip...' : 'Proceed to Itinerary Builder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
