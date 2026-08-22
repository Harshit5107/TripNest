import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Search, Globe, Filter, Star, Heart, ShieldCheck, Plus, MapPin, Sparkles, X } from 'lucide-react';

export default function CitySearchScreen() {
  const { user, navigateTo, setAuthModalOpen, showToast } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState('All');

  // Add Custom City Modal State
  const [addCityModalOpen, setAddCityModalOpen] = useState(false);
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('Europe');
  const [costIndex, setCostIndex] = useState('$$');
  const [avgCost, setAvgCost] = useState(120);
  const [desc, setDesc] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCities();
  }, [searchTerm, selectedRegion, selectedCostIndex, user]);

  async function loadCities() {
    try {
      setLoading(true);
      const data = await api.getCities({
        search: searchTerm,
        region: selectedRegion,
        cost_index: selectedCostIndex,
        userId: user?.id,
        autoCreate: 'true'
      });
      setCities(data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFavorite = async (e, cityId) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavoriteCity(user.id, cityId);
      setCities(cities.map(c => c.id === cityId ? { ...c, is_favorite: res.is_favorite } : c));
      showToast(res.is_favorite ? 'City added to saved favorites!' : 'Removed from favorites.', 'info');
    } catch (err) {
      showToast('Failed to toggle favorite', 'error');
    }
  };

  const handleAddCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityName) return;
    setSubmitting(true);
    try {
      const newCity = await api.addCustomCity({
        name: cityName,
        country: country || 'Global Destination',
        region,
        cost_index: costIndex,
        avg_cost_per_day: parseFloat(avgCost),
        description: desc,
        image_url: imgUrl,
      });

      showToast(`City "${newCity.name}" added to global database!`, 'success');
      setAddCityModalOpen(false);
      setCityName('');
      setCountry('');
      setDesc('');
      loadCities();
    } catch (err) {
      showToast('Failed to add city', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Destinations Directory ({cities.length} Cities)</span>
          </div>
          <h1 className="text-3xl font-black text-white">Search & Discover Any City</h1>
          <p className="text-sm text-slate-400">Search 60+ seeded global metropolises or add ANY city in the world to your trip plan.</p>
        </div>

        <button
          onClick={() => setAddCityModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Custom City</span>
        </button>
      </div>

      {/* Filter Control Matrix */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          {/* Search Bar */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ANY city, country, or keyword (e.g. Florence, Kyoto, Geneva)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Region Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Middle East">Middle East</option>
              <option value="Oceania">Oceania</option>
              <option value="Africa">Africa</option>
            </select>
          </div>

          {/* Cost Index Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedCostIndex}
              onChange={(e) => setSelectedCostIndex(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Cost Levels</option>
              <option value="$">$ (Budget Friendly)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Premium)</option>
              <option value="$$$$">$$$$ (Luxury)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Searching global destinations...</div>
      ) : cities.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-4">
          <Globe className="w-12 h-12 text-sky-400 mx-auto opacity-50 animate-bounce" />
          <h3 className="text-lg font-bold text-white">City Not Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No exact matches found. Would you like to add <span className="font-bold text-sky-400">"{searchTerm}"</span> to the global travel database?
          </p>
          <button
            onClick={() => {
              setCityName(searchTerm);
              setAddCityModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-lg"
          >
            + Add "{searchTerm}" to Database
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-slate-800/80 group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Cost Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-xs font-bold text-sky-400 border border-slate-700">
                  {city.cost_index} • ${city.avg_cost_per_day}/day
                </div>

                {/* Favorite Toggle Button */}
                <button
                  onClick={(e) => handleToggleFavorite(e, city.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-rose-400 border border-slate-700/60 backdrop-blur-md transition-all"
                >
                  <Heart className={`w-4 h-4 ${city.is_favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

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

                <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Safety: {city.safety_index || 90}/100</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) setAuthModalOpen(true);
                      else navigateTo('create-trip', { cityId: city.id });
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-sky-500/25 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan Trip Here</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom City Modal */}
      {addCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <button
              onClick={() => setAddCityModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <span>Add Custom Destination City</span>
            </h3>

            <form onSubmit={handleAddCitySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Florence, Geneva, Zermatt..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Italy, Switzerland..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cost Index</label>
                  <select
                    value={costIndex}
                    onChange={(e) => setCostIndex(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="$">$ (Budget)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Premium)</option>
                    <option value="$$$$">$$$$ (Luxury)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief travel summary of city attraction..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddCityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 text-white font-bold shadow-lg"
                >
                  {submitting ? 'Saving...' : 'Add City to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
