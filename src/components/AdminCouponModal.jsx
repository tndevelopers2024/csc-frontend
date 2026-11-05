import React, { useState } from 'react';
import { FiX, FiTag, FiCalendar, FiClock, FiZap, FiCheckCircle, FiMail } from 'react-icons/fi';

export default function AdminCouponModal({ isOpen, onClose, user, onCouponCreated }) {
  if (!isOpen || !user) return null;

  const [code, setCode] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'CSC-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Coupon code is required.');
      return;
    }

    const numHours = Number(hours);
    if (!numHours || numHours <= 0) {
      setError('Please enter a valid number of hours greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          code: code.trim().toUpperCase(),
          hours: numHours,
          description: description.trim(),
          expiresAt: expiresAt || null,
          sendEmail
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onCouponCreated) onCouponCreated(data.coupon, data.message);
        onClose();
      } else {
        setError(data.message || 'Failed to create coupon.');
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      setError('Network error while creating coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user.name || user.email || 'Customer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FiTag size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Set One-Time Hours Coupon</h2>
              <p className="text-xs text-gray-500">
                Exclusive to: <span className="font-semibold text-blue-600">{userName}</span> ({user.email})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Coupon Code */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Coupon Code *</label>
              <button 
                type="button" 
                onClick={generateRandomCode} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                <FiZap size={12} /> Generate Code
              </button>
            </div>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FREE5HRS, SPECIAL10" 
              className="w-full border border-gray-200 rounded-lg p-3 text-sm font-mono uppercase tracking-wider font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          {/* Coupon Hours */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiClock className="text-blue-600" /> Coupon CAD Hours *
            </label>
            <div className="relative">
              <input 
                type="number" 
                min="0.5" 
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 5, 10, 20"
                className="w-full border border-gray-200 rounded-lg p-3 pr-14 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                HOURS
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Equivalent value: <strong>${(Number(hours) || 0) * 50} USD</strong> (@ $50/hr standard rate).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description / Reason (Optional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Special promotional 5 CAD hours for quote review" 
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Expiration Date (Optional)</label>
            <div className="relative">
              <input 
                type="date" 
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-gray-700"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Leave blank if the coupon should never expire until used.</p>
          </div>

          {/* Hours Retention Notice */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <FiCheckCircle className="text-blue-600 mt-0.5 shrink-0 text-base" />
            <p className="leading-relaxed">
              <strong>Hours Retention Guarantee:</strong> If the customer applies this coupon to a project that requires fewer hours than the coupon, any remaining hours are <strong>automatically retained in their account balance</strong> for future projects.
            </p>
          </div>

          {/* Share via Email option */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FiMail size={16} />
              </span>
              <div>
                <label htmlFor="sendEmailCheckbox" className="text-xs font-bold text-gray-900 cursor-pointer">
                  Share Coupon Code via Email
                </label>
                <p className="text-[11px] text-gray-500">
                  Sends an email to <strong>{user.email}</strong> with coupon code and instructions.
                </p>
              </div>
            </div>
            <input 
              id="sendEmailCheckbox"
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {submitting ? 'Setting Coupon...' : 'Set One-Time Coupon'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

