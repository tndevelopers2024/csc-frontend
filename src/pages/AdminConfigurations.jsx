import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiHistory, BiMoney } from 'react-icons/bi';

export default function AdminConfigurations() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    country: 'United States',
    hourlyRate: '',
    isActive: true
  });

  const countries = [
    'United States', 'India', 'United Kingdom', 'Canada', 
    'Australia', 'Germany', 'France', 'Singapore', 'Japan'
  ];

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/rates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch (err) {
      console.error('Error fetching rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingRate ? 'PUT' : 'POST';
      const url = editingRate 
        ? `${import.meta.env.VITE_API_URL}/admin/rates/${editingRate._id}`
        : `${import.meta.env.VITE_API_URL}/admin/rates`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingRate(null);
        setFormData({ country: 'United States', hourlyRate: '', isActive: true });
        fetchRates();
      }
    } catch (err) {
      console.error('Error saving rate', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/rates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRates();
      }
    } catch (err) {
      console.error('Error deleting rate', err);
    }
  };

  const openEditModal = (rate) => {
    setEditingRate(rate);
    setFormData({
      country: rate.country,
      hourlyRate: rate.hourlyRate,
      isActive: rate.isActive
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8 flex items-center gap-3">
        <BiMoney className="text-3xl text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Rate Configuration</h1>
          <p className="text-gray-500 text-sm">Manage country-specific rates in USD</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <BiHistory className="text-xl text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">Rate History</h2>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input type="text" placeholder="Search rates..." className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-blue-500" />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white outline-none">
              <option>All</option>
              <option>Active Only</option>
            </select>
            <button 
              onClick={() => {
                setEditingRate(null);
                setFormData({ country: 'United States', hourlyRate: '', isActive: true });
                setShowModal(true);
              }}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors text-sm"
            >
              <BiPlus className="text-lg" /> New Rate
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Country</th>
                <th className="py-4 px-6 text-center">Rate (USD)</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">Loading rates...</td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">No rates configured yet.</td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🌎</span>
                        <span className="text-sm font-semibold text-gray-800">{rate.country}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-600">
                      ${rate.hourlyRate.toFixed(2)}/hour
                    </td>
                    <td className="py-4 px-6 text-center">
                      {rate.isActive ? (
                        <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-gray-500">
                      {new Date(rate.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-3">
                      <button onClick={() => openEditModal(rate)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold">
                        <BiEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(rate._id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold">
                        <BiTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Rate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{editingRate ? 'Edit Rate' : 'Create New Rate'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Per Hour (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full pl-7 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">/hour</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <select 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none bg-white"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Set as active rate for this country
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                  <BiEdit /> {editingRate ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                  <span className="text-xl">×</span> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
