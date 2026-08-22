import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [sharedSlug, setSharedSlug] = useState(null);
  const [toast, setToast] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const login = async (credentials) => {
    const data = await api.login(credentials);
    setUser(data.user);
    localStorage.setItem('gt_user', JSON.stringify(data.user));
    localStorage.setItem('gt_token', data.token);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    setAuthModalOpen(false);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    localStorage.setItem('gt_user', JSON.stringify(data.user));
    localStorage.setItem('gt_token', data.token);
    showToast(`Account created! Welcome to GlobeTrotter, ${data.user.name}!`, 'success');
    setAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gt_user');
    localStorage.removeItem('gt_token');
    setActiveView('dashboard');
    showToast('Logged out successfully.', 'info');
  };

  const navigateTo = (view, payload = {}) => {
    if (payload.tripId) setSelectedTripId(payload.tripId);
    if (payload.cityId) setSelectedCityId(payload.cityId);
    if (payload.slug) setSharedSlug(payload.slug);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        activeView,
        navigateTo,
        selectedTripId,
        setSelectedTripId,
        selectedCityId,
        setSelectedCityId,
        sharedSlug,
        setSharedSlug,
        toast,
        showToast,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
