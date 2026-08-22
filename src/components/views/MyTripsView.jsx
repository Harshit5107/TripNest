import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MapPin, Calendar, DollarSign, Plus, Search, Trash2, Share2, Edit3, Eye, PieChart } from 'lucide-react';

export default function MyTripsView() {
  const { user, navigateTo, showToast } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadTrips() {
      if (!user) return;
      try {
        const data = await api.getUserTrips(user.id);
        setTrips(data);
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [user]);

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await api.deleteTrip(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
      showToast('Trip deleted successfully.', 'info');
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">My Trips & Itineraries</h1>
          <p className="text-sm text-slate-400">Manage all your saved multi-city travel plans in one place</p>
        </div>

        <button
          onClick={() => navigateTo('create-trip')}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        
        {/* Filter Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {['all', 'upcoming', 'completed', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                filterStatus === status ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trips..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading your travel itineraries...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <MapPin className="w-12 h-12 text-sky-400 mx-auto opacity-50 animate-bounce" />
          <h3 className="text-xl font-bold text-white">No Trips Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You don't have any trips matching your current filter. Start planning a multi-city journey today!
          </p>
          <button
            onClick={() => navigateTo('create-trip')}
            className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold text-xs"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigateTo('itinerary-view', { tripId: trip.id })}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-slate-800 group flex flex-col justify-between cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.cover_image}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-sky-400 border border-slate-700">
                  {trip.status.toUpperCase()}
                </div>

                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <button
                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                    title="Delete Trip"
                    className="p-2 rounded-full bg-slate-900/80 hover:bg-rose-500/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {trip.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="block font-bold text-white">{trip.stop_count}</span>
                    <span className="block text-[10px] text-slate-400">Cities</span>
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-400">${trip.target_budget}</span>
                    <span className="block text-[10px] text-slate-400">Target</span>
                  </div>
                  <div>
                    <span className="block font-bold text-amber-400">${Math.round(trip.calculated_cost || 0)}</span>
                    <span className="block text-[10px] text-slate-400">Est. Cost</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('budget', { tripId: trip.id });
                      }}
                      title="Budget Charts"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                    >
                      <PieChart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('itinerary-builder', { tripId: trip.id });
                      }}
                      title="Edit Itinerary Builder"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('shared', { slug: trip.share_slug });
                      }}
                      title="Shared View"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
