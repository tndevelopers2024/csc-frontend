import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { BiSad } from 'react-icons/bi';
import { FiTag, FiPlus, FiTrash2, FiClock, FiCheckCircle, FiMail } from 'react-icons/fi';
import AdminCouponModal from '../components/AdminCouponModal';

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendCouponEmail = async (couponId) => {
    try {
      setSendingEmailId(couponId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/admin/${couponId}/send-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.message || 'Coupon shared to customer via email!');
      } else {
        showToast(resData.message || 'Failed to send coupon email', 'error');
      }
    } catch (err) {
      console.error('Error sending coupon email:', err);
      showToast('Error sending coupon email', 'error');
    } finally {
      setSendingEmailId(null);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'x-auth-token': token };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, { headers });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/admin/user/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setCoupons(list);
      }
    } catch (err) {
      console.error('Error fetching user coupons:', err);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchUserCoupons();
  }, [id]);

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/admin/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Coupon deleted successfully');
        fetchUserCoupons();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete coupon', 'error');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      showToast('Error deleting coupon', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006fee]"></div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="p-8 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  const { user, projects } = data;
  const name = `${user.firstName} ${user.lastName}`;
  const initial = user.firstName ? user.firstName[0].toUpperCase() : 'U';
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-GB');

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans px-4 pt-4 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 right-8 z-50 animate-in fade-in">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gray-900 text-white border-gray-800'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Back Link */}
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-[#006fee] hover:text-blue-700 font-medium mb-6 transition-colors">
        <FaArrowLeft size={14} /> Back to Users
      </Link>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-[#006fee] flex items-center justify-center text-2xl font-bold">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
              <p className="text-gray-500 text-sm capitalize">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={() => setCouponModalOpen(true)}
            className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiPlus size={14} /> Set One-Time Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Contact Information</h3>
            <p className="text-sm font-medium text-gray-800 mb-1">{user.email}</p>
            <p className="text-sm text-gray-600">{user.mobilePrefix}{user.mobile}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Company Information</h3>
            <p className="text-sm font-medium text-gray-800 mb-1">Individual</p>
            <p className="text-sm text-gray-500">Not specified</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Account Status</h3>
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold">
                Pending Verification
              </span>
            </div>
            <p className="text-sm text-gray-600">Joined on {joinedDate}</p>
          </div>
        </div>
      </div>

      {/* One-Time Coupons Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiTag size={16} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Assigned One-Time Coupons</h2>
              <p className="text-xs text-gray-500">Exclusive coupons created for this user (strictly 1-time redemption)</p>
            </div>
          </div>
          <button
            onClick={() => setCouponModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <FiPlus size={13} /> Add Coupon
          </button>
        </div>

        {coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">CAD Hours</th>
                  <th className="py-3 px-4">Status & Hours Retained</th>
                  <th className="py-3 px-4">Created / Expiry</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.code}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {c.hours || c.discountValue || 0} hrs
                      <span className="block text-[10px] text-gray-400 font-normal">(${((c.hours || c.discountValue || 0) * 50).toFixed(0)} value)</span>
                    </td>
                    <td className="py-3 px-4">
                      {c.isUsed ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                            <FiCheckCircle size={11} className="text-gray-400" /> Used on {c.usedAt ? new Date(c.usedAt).toLocaleDateString('en-GB') : 'Project'}
                          </span>
                          <span className="block text-[10px] text-gray-500 font-medium">
                            {c.hoursApplied || 0} hrs applied
                            {c.hoursRetained > 0 && <span className="text-emerald-600 font-bold"> • {c.hoursRetained} hrs retained</span>}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <FiClock size={11} className="text-emerald-500" /> Active (1-Time)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                      {c.expiresAt && <span className="block text-[10px] text-gray-400">Exp: {new Date(c.expiresAt).toLocaleDateString('en-GB')}</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                      {c.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSendCouponEmail(c._id)}
                          disabled={sendingEmailId === c._id}
                          className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                          title="Share coupon code to customer via email"
                        >
                          <FiMail size={14} className={sendingEmailId === c._id ? 'animate-pulse text-blue-500' : ''} />
                        </button>
                        {!c.isUsed ? (
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete unused coupon"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic px-1">Redeemed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
            <FiTag className="text-gray-300 text-3xl mb-2" />
            <p className="text-xs font-semibold text-gray-600">No coupons set for this user yet.</p>
            <p className="text-[11px] text-gray-400 mb-4">You can set an exclusive one-time discount code for this customer.</p>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FiPlus size={13} /> Set One-Time Coupon
            </button>
          </div>
        )}
      </div>

      {/* Quotations Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Quotations</h2>
        
        {projects && projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Project Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created At</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map(project => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{project.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(project.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/admin/quotes/${project._id}`} className="text-sm text-[#006fee] hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <BiSad className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No quotations</h3>
            <p className="text-sm text-gray-500 mb-6">This user hasn't created any quotations yet.</p>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      <AdminCouponModal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        user={user}
        onCouponCreated={() => {
          showToast('Coupon assigned successfully!');
          fetchUserCoupons();
        }}
      />

    </div>
  );
}
