import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Search, Filter, Star, Clock, DollarSign, Plus, Sparkles, MapPin } from 'lucide-react';

export default function ActivitySearchScreen() {
  const { user, navigateTo, showToast } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState(200);

  // Add Custom Activity Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [newCityId, setNewCityId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Sightseeing');
  const [newCost, setNewCost] = useState(30);
  const [newDuration, setNewDuration] = useState(2);
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadActivities();
  }, [searchTerm, selectedCategory, maxCost]);

  async function loadActivities() {
    try {
      setLoading(true);
      const data = await api.getActivities({
        search: searchTerm,
        category: selectedCategory,
        max_cost: maxCost,
      });
      setActivities(data);
      const allCities = await api.getCities();
      setCities(allCities);
      if (allCities.length > 0 && !newCityId) setNewCityId(allCities[0].id);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await api.createActivity({
        city_id: newCityId,
        title: newTitle,
        category: newCategory,
        cost: parseFloat(newCost),
        duration_hours: parseFloat(newDuration),
        description: newDesc,
      });
      showToast('Custom activity created!', 'success');
      setAddModalOpen(false);
      loadActivities();
    } catch (err) {
      showToast('Failed to create activity', 'error');
    }
  };

  const categories = ['All', 'Sightseeing', 'Culture', 'Food & Dining', 'Adventure', 'Relaxation', 'Nightlife'];

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Browse Activities & Experiences</h1>
          <p className="text-sm text-slate-400">Curate your stops with rated tours, culinary walks, and adventures</p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Experience</span>
        </button>
      </div>

      {/* Filter Control Matrix */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        
        {/* Category Pill Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
          
          {/* Search Bar */}
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by activity title or keyword..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Max Cost Filter */}
          <div className="sm:col-span-4 flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 whitespace-nowrap">Max Price: ${maxCost}</span>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
          <Sparkles className="w-12 h-12 text-sky-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No Activities Match Filter</h3>
          <p className="text-xs text-slate-400">Try adjusting your price slider or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-slate-800/80 group flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={act.image_url}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-sky-400 border border-slate-700">
                  {act.category}
                </div>

                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{act.rating}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[11px] font-semibold text-emerald-400 block">
                    📍 {act.city_name}, {act.country}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1">{act.title}</h3>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{act.duration_hours}h</span>
                    </span>
                  </div>

                  <span className="text-base font-black text-emerald-400">
                    ${act.cost}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Activity Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Create Custom Experience</h3>
            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">City</label>
                <select
                  value={newCityId}
                  onChange={(e) => setNewCityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Secret Rooftop Cocktail Lounge"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Culture">Culture</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Nightlife">Nightlife</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 text-white font-bold"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
