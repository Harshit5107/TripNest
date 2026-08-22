import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Calendar, MapPin, DollarSign, Clock, Share2, Edit3, PieChart, Star, Compass, Layers } from 'lucide-react';

export default function ItineraryViewScreen() {
  const { selectedTripId, navigateTo, showToast } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'city'

  useEffect(() => {
    async function loadTrip() {
      if (!selectedTripId) return;
      try {
        setLoading(true);
        const data = await api.getTripById(selectedTripId);
        setTrip(data);
      } catch (err) {
        console.error('Error loading trip view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [selectedTripId]);

  if (loading || !trip) {
    return <div className="text-center py-20 text-slate-400">Loading Itinerary View...</div>;
  }

  // Calculate day-by-day map
  const daysMap = {};
  trip.stops.forEach(stop => {
    stop.activities.forEach(act => {
      const dayNum = act.scheduled_day || 1;
      if (!daysMap[dayNum]) daysMap[dayNum] = [];
      daysMap[dayNum].push({ ...act, cityName: stop.city_name, cityCountry: stop.country });
    });
  });

  const sortedDays = Object.keys(daysMap).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Cover Banner Hero */}
      <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <img src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/80 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                {trip.status}
              </span>
              <span className="text-xs text-slate-300">
                Created by {trip.author_name}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>{new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{trip.stops.length} Cities</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Budget: ${trip.target_budget}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateTo('itinerary-builder', { tripId: trip.id })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs"
            >
              <Edit3 className="w-4 h-4 text-sky-400" />
              <span>Edit Stops</span>
            </button>

            <button
              onClick={() => navigateTo('shared', { slug: trip.share_slug })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white">Itinerary Breakdown</h2>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Day-by-Day Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('city')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'city' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Grouped by City</span>
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        sortedDays.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs">
            No scheduled daily activities yet. Use the Itinerary Builder to assign experiences!
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDays.map((dayNum) => (
              <div key={dayNum} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                    D{dayNum}
                  </div>
                  <h3 className="text-xl font-bold text-white">Day {dayNum} Schedule</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-sky-500/30">
                  {daysMap[dayNum].map((act) => (
                    <div
                      key={act.id}
                      className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <img src={act.image_url} alt={act.title} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                            📍 {act.cityName} • {act.scheduled_time}
                          </span>
                          <h4 className="text-sm font-bold text-white">{act.title}</h4>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-semibold text-slate-300 border border-slate-700">
                            {act.category}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                        <span className="text-slate-400">Est. Duration: {act.duration_hours}h</span>
                        <span className="font-extrabold text-emerald-400">${act.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Grouped by City View */
        <div className="space-y-6">
          {trip.stops.map((stop) => (
            <div key={stop.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-4">
                <img src={stop.city_image} alt={stop.city_name} className="w-14 h-14 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-white">{stop.city_name}, {stop.country}</h3>
                  <p className="text-xs text-slate-400">Cost Index: {stop.cost_index} • Accommodation: ${stop.stay_cost}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stop.activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                    <img src={act.image_url} alt={act.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="block font-bold text-xs text-white">{act.title}</span>
                      <span className="block text-[10px] text-sky-400">Day {act.scheduled_day} • ${act.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
