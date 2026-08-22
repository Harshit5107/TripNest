import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Shield, Users, MapPin, Globe, Database, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardScreen() {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const s = await api.getAdminStats();
      setStats(s);
      const u = await api.getAdminUsers();
      setUsersList(u);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`User role updated to ${newRole}!`, 'success');
    } catch (err) {
      showToast('Failed to update user role', 'error');
    }
  };

  if (loading || !stats) {
    return <div className="text-center py-20 text-slate-400">Loading Admin Dashboard & Platform Analytics...</div>;
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Suite</span>
          </div>
          <h1 className="text-3xl font-black text-white">Admin & Analytics Dashboard</h1>
          <p className="text-sm text-slate-400">Monitor platform usage, trip trends, user adoption, and MySQL database state</p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
          <span className="block text-3xl font-black text-white">{stats.total_users}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Trips Created</span>
          <span className="block text-3xl font-black text-sky-400">{stats.total_trips}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexed Cities</span>
          <span className="block text-3xl font-black text-emerald-400">{stats.total_cities}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Public Shared Trips</span>
          <span className="block text-3xl font-black text-amber-400">{stats.public_trips}</span>
        </div>

      </div>

      {/* Top Visited Destinations Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          <span>Most Popular Itinerary Destinations</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.top_cities}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }} />
              <Bar dataKey="trip_count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>User Account Management</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Travel Style</th>
                <th className="p-3.5">Trips</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold text-white">{u.name}</td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5 text-sky-400 font-semibold">{u.travel_style || 'Explorer'}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{u.total_trips}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                    >
                      Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
