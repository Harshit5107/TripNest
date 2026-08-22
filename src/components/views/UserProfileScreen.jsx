import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Heart, Settings, Shield, MapPin, Check, Save, LogOut, Trash2 } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
];

export default function UserProfileScreen() {
  const { user, setUser, logout, showToast, navigateTo } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [travelStyle, setTravelStyle] = useState(user?.travel_style || 'Explorer');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      try {
        const favs = await api.getFavoriteCities(user.id);
        setFavorites(favs);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      }
    }
    loadFavorites();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const res = await api.updateProfile(user.id, {
        name,
        bio,
        travel_style: travelStyle,
        avatar,
      });

      setUser(res.user);
      localStorage.setItem('gt_user', JSON.stringify(res.user));
      showToast('Profile settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-slate-400">Please sign in to access your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Traveler Profile & Settings</h1>
        <p className="text-sm text-slate-400">Manage your personal details, travel preferences, and saved destinations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-sky-400" />
            <span>Profile Details</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Choose Avatar</label>
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {AVATAR_PRESETS.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt="Avatar"
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-12 h-12 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                      avatar === imgUrl ? 'border-sky-500 scale-110 shadow-lg shadow-sky-500/30' : 'border-transparent opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Bio / Travel Motto</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel philosophy..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Travel Style Persona</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Explorer">Explorer & Nomad</option>
                <option value="Luxury">Luxury Traveler</option>
                <option value="Backpacker">Budget Backpacker</option>
                <option value="Culture & Photography">Culture & Photography</option>
                <option value="Adventure">Adventure Enthusiast</option>
              </select>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={logout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Favorites & Stats Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Saved Favorite Cities ({favorites.length})</span>
            </h3>

            {favorites.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No saved cities yet. Click the heart icon on any city card to save your favorites!
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {favorites.map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigateTo('city-search', { search: c.name })}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-sky-500/40"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="block font-bold text-xs text-white">{c.name}</span>
                        <span className="block text-[10px] text-slate-400">{c.country}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400">{c.cost_index}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
