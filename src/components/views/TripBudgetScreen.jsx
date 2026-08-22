import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, Calendar, ArrowLeft, Download, ShieldAlert, Globe, CheckSquare, Square, Plus, Trash2, CloudSun } from 'lucide-react';

const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, name: 'USD - US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'EUR - Euro' },
  GBP: { symbol: '£', rate: 0.78, name: 'GBP - British Pound' },
  JPY: { symbol: '¥', rate: 155.0, name: 'JPY - Japanese Yen' },
  INR: { symbol: '₹', rate: 83.5, name: 'INR - Indian Rupee' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'AUD - Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'CAD - Canadian Dollar' },
};

const INITIAL_PACKING_ITEMS = [
  { id: 1, text: 'Passport & Visa Documents', category: 'Essentials', checked: true },
  { id: 2, text: 'Universal Travel Power Adapter', category: 'Electronics', checked: true },
  { id: 3, text: 'Noise-Canceling Headphones', category: 'Electronics', checked: false },
  { id: 4, text: 'Weather-appropriate Outfits & Jackets', category: 'Clothing', checked: true },
  { id: 5, text: 'Comfortable Walking Sneakers', category: 'Footwear', checked: false },
  { id: 6, text: 'Personal Toiletries & Sunscreen', category: 'Personal', checked: false },
  { id: 7, text: 'Emergency First Aid Kit & Medications', category: 'Essentials', checked: true },
];

export default function TripBudgetScreen() {
  const { selectedTripId, navigateTo, showToast } = useAuth();
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Advanced Feature: Currency Converter
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Advanced Feature: Smart Packing List Generator
  const [packingList, setPackingList] = useState(INITIAL_PACKING_ITEMS);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    async function loadBudget() {
      if (!selectedTripId) return;
      try {
        setLoading(true);
        const data = await api.getBudgetAnalytics(selectedTripId);
        setBudgetData(data);
      } catch (err) {
        console.error('Failed to load budget data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [selectedTripId]);

  if (loading || !budgetData) {
    return <div className="text-center py-20 text-slate-400">Calculating trip budget analytics & currency rates...</div>;
  }

  const curr = CURRENCIES[selectedCurrency] || CURRENCIES.USD;
  const formatCost = (usdAmount) => {
    const val = (usdAmount * curr.rate).toFixed(curr.selectedCurrency === 'JPY' ? 0 : 2);
    return `${curr.symbol}${val}`;
  };

  const togglePackingItem = (id) => {
    setPackingList(packingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addPackingItem = (e) => {
    e.preventDefault();
    if (!newItemText) return;
    setPackingList([
      ...packingList,
      { id: Date.now(), text: newItemText, category: 'Personal', checked: false }
    ]);
    setNewItemText('');
    showToast('Added item to packing list!', 'info');
  };

  const deletePackingItem = (id) => {
    setPackingList(packingList.filter(i => i.id !== id));
  };

  const exportCSV = () => {
    let csv = `Category,Amount (${selectedCurrency})\n`;
    budgetData.breakdown.forEach(item => {
      csv += `"${item.category}",${(item.amount * curr.rate).toFixed(2)}\n`;
    });
    csv += `\nTarget Budget,${formatCost(budgetData.target_budget)}\nTotal Estimated Cost,${formatCost(budgetData.total_calculated_cost)}\nAvg Cost/Day,${formatCost(budgetData.avg_cost_per_day)}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globetrotter-budget-trip-${budgetData.trip_id}.csv`;
    a.click();
    showToast('Exported budget report to CSV!', 'success');
  };

  const convertedChartData = budgetData.breakdown.map(item => ({
    category: item.category,
    amount: parseFloat((item.amount * curr.rate).toFixed(2))
  }));

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header & Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigateTo('itinerary-view', { tripId: selectedTripId })}
            className="inline-flex items-center space-x-1 text-xs font-bold text-sky-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary</span>
          </button>
          <h1 className="text-3xl font-black text-white">Trip Financial & Currency Dashboard</h1>
          <p className="text-sm text-slate-400">Automated category breakdowns, multi-currency conversion, and smart packing lists</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Multi-Currency Converter Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-2xl border border-slate-700">
            <Globe className="w-4 h-4 text-sky-400" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {Object.keys(CURRENCIES).map(code => (
                <option key={code} value={code} className="bg-slate-900 text-white">
                  {CURRENCIES[code].name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-bold shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overbudget Safety Warning Banner */}
      {budgetData.is_over_budget ? (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-4 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-rose-500 flex-shrink-0" />
          <div>
            <h3 className="text-base font-bold text-rose-400">Over-Budget Alert!</h3>
            <p className="text-xs text-rose-300">
              Your estimated trip expenses ({formatCost(budgetData.total_calculated_cost)}) exceed your target budget ({formatCost(budgetData.target_budget)}) by <span className="font-bold">{formatCost(budgetData.over_amount)}</span>. Consider adjusting stay options or activity choices in Itinerary Builder.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300">
            Great news! Your estimated trip expenses ({formatCost(budgetData.total_calculated_cost)}) are well within your target budget of {formatCost(budgetData.target_budget)}.
          </p>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Budget</span>
          <span className="block text-2xl font-black text-white">{formatCost(budgetData.target_budget)}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Est. Total Cost</span>
          <span className={`block text-2xl font-black ${budgetData.is_over_budget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatCost(budgetData.total_calculated_cost)}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Cost / Day</span>
          <span className="block text-2xl font-black text-sky-400">{formatCost(budgetData.avg_cost_per_day)}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
          <span className="block text-2xl font-black text-amber-400">{budgetData.days_count} Days</span>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pie / Donut Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Expense Distribution by Category ({selectedCurrency})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={convertedChartData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  label={({ category, amount }) => `${category}: ${curr.symbol}${amount}`}
                >
                  {convertedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Category Spend Breakdown ({selectedCurrency})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convertedChartData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }} />
                <Bar dataKey="amount" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Advanced Feature: Smart Packing List Checklist */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Trip Packing List Generator & Checklist</span>
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">
            {packingList.filter(i => i.checked).length} of {packingList.length} Packed
          </span>
        </div>

        <form onSubmit={addPackingItem} className="flex space-x-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add new custom item to packing checklist..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold"
          >
            + Add Item
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {packingList.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePackingItem(item.id)}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                item.checked
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 line-through opacity-75'
                  : 'bg-slate-950 border-slate-800 text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span>{item.text}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePackingItem(item.id);
                }}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
