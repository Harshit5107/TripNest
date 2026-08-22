import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Plus, ArrowUp, ArrowDown, Trash2, Calendar, MapPin, DollarSign, Clock, Eye, PieChart, Check, X, Search, Sparkles } from 'lucide-react';

export default function ItineraryBuilderView() {
  const { selectedTripId, navigateTo, showToast } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Stop Modal State
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [stayCost, setStayCost] = useState(200);
  const [transportCost, setTransportCost] = useState(100);

  // Add Activity Modal State
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [scheduledDay, setScheduledDay] = useState(1);
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');

  useEffect(() => {
    loadTripData();
  }, [selectedTripId]);

  async function loadTripData() {
    if (!selectedTripId) return;
    try {
      setLoading(true);
      const data = await api.getTripById(selectedTripId);
      setTrip(data);
      const cities = await api.getCities();
      setAvailableCities(cities);
    } catch (err) {
      console.error('Failed to load trip data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleReorderStop = async (stopIndex, direction) => {
    if (!trip || !trip.stops) return;
    const newStops = [...trip.stops];
    const targetIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    // Swap
    const temp = newStops[stopIndex];
    newStops[stopIndex] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    const stopIds = newStops.map(s => s.id);
    try {
      const updated = await api.reorderStops(trip.id, stopIds);
      setTrip(updated);
      showToast('Stop order updated!', 'success');
    } catch (err) {
      showToast('Failed to reorder stops', 'error');
    }
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCityId) return;
    try {
      const updated = await api.addStop(trip.id, {
        city_id: selectedCityId,
        stay_cost: parseFloat(stayCost),
        transport_cost: parseFloat(transportCost),
      });
      setTrip(updated);
      setAddStopModalOpen(false);
      showToast('City stop added to itinerary!', 'success');
    } catch (err) {
      showToast('Failed to add city stop', 'error');
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this city stop from your itinerary?')) return;
    try {
      const updated = await api.deleteStop(stopId);
      setTrip(updated);
      showToast('Stop removed.', 'info');
    } catch (err) {
      showToast('Failed to remove stop', 'error');
    }
  };

  const openAddActivityModal = async (stop) => {
    setActiveStopId(stop.id);
    try {
      const activities = await api.getActivities({ city_id: stop.city_id });
      setCityActivities(activities);
      if (activities.length > 0) setSelectedActivityId(activities[0].id);
      setAddActivityModalOpen(true);
    } catch (err) {
      showToast('Failed to load city activities', 'error');
    }
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivityId || !activeStopId) return;
    try {
      const updated = await api.addActivityToStop(activeStopId, {
        activity_id: selectedActivityId,
        scheduled_day: parseInt(scheduledDay),
        scheduled_time: scheduledTime,
      });
      setTrip(updated);
      setAddActivityModalOpen(false);
      showToast('Activity added to day plan!', 'success');
    } catch (err) {
      showToast('Failed to add activity', 'error');
    }
  };

  const handleDeleteActivity = async (saId) => {
    try {
      const updated = await api.deleteStopActivity(saId);
      setTrip(updated);
      showToast('Activity removed from itinerary', 'info');
    } catch (err) {
      showToast('Failed to remove activity', 'error');
    }
  };

  if (loading || !trip) {
    return <div className="text-center py-20 text-slate-400">Loading Itinerary Builder...</div>;
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Interactive Builder</span>
            <h1 className="text-3xl font-black text-white">{trip.title}</h1>
            <p className="text-xs text-slate-400">{trip.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateTo('itinerary-view', { tripId: trip.id })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
            >
              <Eye className="w-4 h-4" />
              <span>Itinerary View</span>
            </button>
            <button
              onClick={() => navigateTo('timeline', { tripId: trip.id })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Calendar Timeline</span>
            </button>
            <button
              onClick={() => navigateTo('budget', { tripId: trip.id })}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Budget Breakdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* City Stops List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Route & City Stops</h2>
          <p className="text-xs text-slate-400">Order your city stops and assign activities day-by-day</p>
        </div>

        <button
          onClick={() => setAddStopModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add City Stop</span>
        </button>
      </div>

      {/* Stops Timeline Accordion */}
      {trip.stops.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <MapPin className="w-10 h-10 text-sky-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No City Stops Added Yet</h3>
          <p className="text-xs text-slate-400">Click "Add City Stop" to add your first destination!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trip.stops.map((stop, index) => (
            <div
              key={stop.id}
              className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 relative overflow-hidden"
            >
              {/* Stop Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-sm">
                    #{index + 1}
                  </div>
                  <img src={stop.city_image} alt={stop.city_name} className="w-12 h-12 rounded-2xl object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>{stop.city_name}</span>
                      <span className="text-xs font-medium text-slate-400">({stop.country})</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium">
                      Cost Index: {stop.cost_index} • Stay Est: ${stop.stay_cost} • Transport: ${stop.transport_cost}
                    </span>
                  </div>
                </div>

                {/* Stop Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReorderStop(index, 'up')}
                    disabled={index === 0}
                    title="Move Up"
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorderStop(index, 'down')}
                    disabled={index === trip.stops.length - 1}
                    title="Move Down"
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openAddActivityModal(stop)}
                    className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white text-xs font-bold border border-sky-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Activity</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-rose-400 border border-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assigned Activities Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scheduled Experiences ({stop.activities.length})
                </h4>

                {stop.activities.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No activities assigned to this stop yet. Click "+ Assign Activity" above to select sightseeing, dining, or adventure experiences.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stop.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between space-x-3 group"
                      >
                        <div className="flex items-center space-x-3">
                          <img src={act.image_url} alt={act.title} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <span className="block font-bold text-xs text-white">{act.title}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="text-sky-400 font-semibold">Day {act.scheduled_day} • {act.scheduled_time}</span>
                              <span>• {act.category}</span>
                              <span className="text-emerald-400 font-bold">${act.cost}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Stop Modal */}
      {addStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Add Destination City Stop</h3>
            <form onSubmit={handleAddStopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select City</label>
                <select
                  required
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none"
                >
                  <option value="">-- Select a city --</option>
                  {availableCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}, {c.country} ({c.cost_index})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Est. Stay Cost ($)</label>
                  <input
                    type="number"
                    value={stayCost}
                    onChange={(e) => setStayCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Transport Cost ($)</label>
                  <input
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 text-xs font-bold text-white"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {addActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Assign Activity to Stop</h3>
            <form onSubmit={handleAddActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Activity</label>
                <select
                  required
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none"
                >
                  {cityActivities.map(a => (
                    <option key={a.id} value={a.id}>{a.title} (${a.cost}) - {a.category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trip Day #</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={scheduledDay}
                    onChange={(e) => setScheduledDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 text-xs font-bold text-white"
                >
                  Assign to Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
