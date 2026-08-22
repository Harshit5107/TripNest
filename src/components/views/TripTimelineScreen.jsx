import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Calendar, Clock, MapPin, ArrowLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function TripTimelineScreen() {
  const { selectedTripId, navigateTo } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      if (!selectedTripId) return;
      try {
        setLoading(true);
        const data = await api.getTripById(selectedTripId);
        setTrip(data);
      } catch (err) {
        console.error('Failed to load trip timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [selectedTripId]);

  if (loading || !trip) {
    return <div className="text-center py-20 text-slate-400">Loading Calendar Timeline...</div>;
  }

  // Generate 14-day calendar grid representation
  const calendarDays = Array.from({ length: 14 }, (_, i) => i + 1);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigateTo('itinerary-view', { tripId: selectedTripId })}
            className="inline-flex items-center space-x-1 text-xs font-bold text-sky-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary View</span>
          </button>
          <h1 className="text-3xl font-black text-white">Trip Calendar & Timeline</h1>
          <p className="text-sm text-slate-400">Visualize your multi-day journey flow and day-wise events</p>
        </div>

        <button
          onClick={() => navigateTo('itinerary-builder', { tripId: selectedTripId })}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg"
        >
          <Eye className="w-4 h-4" />
          <span>Edit in Builder</span>
        </button>
      </div>

      {/* City Stops Legend */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">City Stop Sequence:</span>
        <div className="flex items-center space-x-2 flex-wrap">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Stop {idx + 1}: {stop.city_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid Representation */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          <span>Daily Itinerary Grid (Days 1 - 14)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {calendarDays.map((dayNum) => {
            // Find activities for this day
            const dayActs = [];
            trip.stops.forEach(s => {
              s.activities.forEach(a => {
                if (a.scheduled_day === dayNum) {
                  dayActs.push({ ...a, cityName: s.city_name });
                }
              });
            });

            return (
              <div
                key={dayNum}
                className={`p-3 rounded-2xl border min-h-[120px] flex flex-col justify-between transition-all ${
                  dayActs.length > 0
                    ? 'bg-slate-900/90 border-sky-500/40 shadow-md hover:border-sky-400'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-400">Day {dayNum}</span>
                  {dayActs.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-[9px] font-bold text-sky-300">
                      {dayActs.length} Acts
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-2">
                  {dayActs.slice(0, 2).map((act) => (
                    <div key={act.id} className="p-1.5 rounded-lg bg-slate-950 text-[10px] text-white border border-slate-800 truncate">
                      <span className="text-sky-400 font-bold">📍 {act.cityName}</span>: {act.title}
                    </div>
                  ))}
                  {dayActs.length > 2 && (
                    <span className="block text-[9px] text-slate-400 text-center">+{dayActs.length - 2} more</span>
                  )}
                </div>

                <span className="block text-[10px] text-slate-500 font-medium text-right">
                  {dayActs.length > 0 ? `$${dayActs.reduce((sum, a) => sum + Number(a.cost), 0)} Total` : 'Free Day'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
