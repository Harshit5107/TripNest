import React from 'react';
import { Globe, Heart, Shield, Github, Twitter, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { navigateTo } = useAuth();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <span className="text-lg font-black text-white">GlobeTrotter</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Personalized multi-city travel planning platform. Design itineraries, track financial budgets automatically, explore 3D destinations, and share trip plans.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigateTo('dashboard')} className="hover:text-sky-400">Dashboard</button></li>
              <li><button onClick={() => navigateTo('my-trips')} className="hover:text-sky-400">My Trips</button></li>
              <li><button onClick={() => navigateTo('city-search')} className="hover:text-sky-400">Explore Cities</button></li>
              <li><button onClick={() => navigateTo('activity-search')} className="hover:text-sky-400">Activities</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Database & Stack</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-emerald-400 font-semibold">MySQL Relational DB</span></li>
              <li><span>Express.js Node Backend</span></li>
              <li><span>React 18 & Vite Frontend</span></li>
              <li><span>Three.js 3D Earth Graphics</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Hackathon Edition</h4>
            <p className="text-xs text-slate-400 mb-3">
              Built for Odoo Hackathon 2026. Empowering travelers with personalized end-to-end itinerary tools.
            </p>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                100% Operational
              </span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 GlobeTrotter. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for personalized global travel.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
