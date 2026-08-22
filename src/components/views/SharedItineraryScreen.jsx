import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Share2, Copy, Check, Calendar, MapPin, DollarSign, User, Sparkles, QrCode, Globe } from 'lucide-react';

export default function SharedItineraryScreen() {
  const { sharedSlug, user, navigateTo, showToast, setAuthModalOpen } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copyingTrip, setCopyingTrip] = useState(false);

  useEffect(() => {
    async function loadSharedTrip() {
      const slugToUse = sharedSlug || 'euro-grand-tour-2026';
      try {
        setLoading(true);
        const data = await api.getSharedTrip(slugToUse);
        setTrip(data);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSharedTrip();
  }, [sharedSlug]);

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    showToast('Itinerary link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCloneTripToAccount = async () => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in to copy this trip to your account!', 'info');
      return;
    }

    setCopyingTrip(true);
    try {
      const copiedTrip = await api.copyTrip(user.id, trip.id);
      showToast(`Copied "${trip.title}" to your account!`, 'success');
      navigateTo('itinerary-builder', { tripId: copiedTrip.id });
    } catch (err) {
      showToast('Failed to copy trip', 'error');
    } finally {
      setCopyingTrip(false);
    }
  };

  if (loading || !trip) {
    return <div className="text-center py-20 text-slate-400">Loading public itinerary...</div>;
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Shared Public Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Public Shared Itinerary</span>
            <span className="text-xs text-slate-300">You are viewing a public community trip plan.</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleCloneTripToAccount}
            disabled={copyingTrip}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>{copyingTrip ? 'Copying...' : 'Copy Trip to My Account'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative h-72 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <img src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="flex items-center space-x-3">
            <img src={trip.creator_avatar || trip.author_name} alt="Creator" className="w-8 h-8 rounded-full border border-sky-400 object-cover" />
            <span className="text-xs font-semibold text-slate-200">Created by {trip.creator_name || trip.author_name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{trip.title}</h1>
          <p className="text-xs text-slate-300 max-w-2xl">{trip.description}</p>
        </div>
      </div>

      {/* City Stops Sequence */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-white">Full Journey Route</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="relative h-36 rounded-2xl overflow-hidden">
                <img src={stop.city_image} alt={stop.city_name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[10px] font-bold text-sky-400">
                  Stop #{idx + 1}
                </div>
                <div className="absolute bottom-2 left-3">
                  <h3 className="text-lg font-bold text-white">{stop.city_name}</h3>
                  <span className="text-[10px] text-emerald-400 font-medium">{stop.country}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Experiences ({stop.activities.length})</span>
                {stop.activities.map(a => (
                  <div key={a.id} className="p-2 rounded-xl bg-slate-950 text-xs font-semibold text-slate-200 flex justify-between">
                    <span>{a.title}</span>
                    <span className="text-emerald-400">${a.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
