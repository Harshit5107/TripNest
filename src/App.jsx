import React from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/views/AuthModal';

import DashboardView from './components/views/DashboardView';
import MyTripsView from './components/views/MyTripsView';
import CreateTripModal from './components/views/CreateTripModal';
import ItineraryBuilderView from './components/views/ItineraryBuilderView';
import ItineraryViewScreen from './components/views/ItineraryViewScreen';
import CitySearchScreen from './components/views/CitySearchScreen';
import ActivitySearchScreen from './components/views/ActivitySearchScreen';
import TripBudgetScreen from './components/views/TripBudgetScreen';
import TripTimelineScreen from './components/views/TripTimelineScreen';
import SharedItineraryScreen from './components/views/SharedItineraryScreen';
import UserProfileScreen from './components/views/UserProfileScreen';
import AdminDashboardScreen from './components/views/AdminDashboardScreen';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

function MainContent() {
  const { activeView, toast } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-slate-100">
      <div>
        <Navbar />
        
        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed top-24 right-4 z-50 animate-bounce">
            <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-bold ${
              toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' :
              toast.type === 'error' ? 'bg-rose-950/90 text-rose-300 border-rose-500/40' :
              'bg-sky-950/90 text-sky-300 border-sky-500/40'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* View Switcher */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'my-trips' && <MyTripsView />}
          {activeView === 'create-trip' && <CreateTripModal />}
          {activeView === 'itinerary-builder' && <ItineraryBuilderView />}
          {activeView === 'itinerary-view' && <ItineraryViewScreen />}
          {activeView === 'city-search' && <CitySearchScreen />}
          {activeView === 'activity-search' && <ActivitySearchScreen />}
          {activeView === 'budget' && <TripBudgetScreen />}
          {activeView === 'timeline' && <TripTimelineScreen />}
          {activeView === 'shared' && <SharedItineraryScreen />}
          {activeView === 'profile' && <UserProfileScreen />}
          {activeView === 'admin' && <AdminDashboardScreen />}
        </main>
      </div>

      <Footer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
