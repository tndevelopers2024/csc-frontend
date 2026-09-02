import React, { useState, useEffect } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FaUser, FaCheckCircle, FaExclamationTriangle, FaBuilding, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'x-auth-token': token };
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006fee]"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Company', count: 0, borderColor: 'border-blue-400', subtitle: 'Corporate accounts' },
    { label: 'User', count: users.filter(u => u.role === 'user').length, borderColor: 'border-green-400', subtitle: 'Individual accounts' },
    { label: 'Freelancer', count: users.filter(u => u.role === 'freelancer').length, borderColor: 'border-yellow-400', subtitle: 'Freelance partners' },
    { label: 'All Users', count: users.length, borderColor: 'border-purple-400', subtitle: 'Total registered' },
  ];

  const filters = ['All', 'Company', 'User', 'Freelancer'];

  const filteredUsers = users.filter(u => {
    if (search) {
      const s = search.toLowerCase();
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (!(name.includes(s) || u.email.toLowerCase().includes(s) || u.mobile.includes(s))) {
        return false;
      }
    }
    
    if (filter === 'All') return true;
    if (filter === 'Company') return u.accountType === 'Company'; // placeholder
    if (filter === 'User') return u.role === 'user';
    if (filter === 'Freelancer') return u.role === 'freelancer';
    
    return true;
  });

  // Calculate hours ago roughly (just for UI placeholder, assuming it means created time or last active)
  const getHoursAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60));
    if (diff < 24) return `${diff} Hours`;
    return `${Math.floor(diff / 24)} Days`;
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
        <p className="text-gray-500 text-sm">{users.length} total users</p>
      </div>
      
      {/* Overview Widgets */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col ${stat.borderColor}`}>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">{stat.label}</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stat.count}</div>
            <p className="text-xs text-gray-400 font-medium">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-96 px-2 pb-2 md:pb-0">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none md:pb-0 pb-2">
            <BiSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            placeholder="Search by name, email, company, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user, idx) => {
                const name = `${user.firstName} ${user.lastName}`;
                const initial = user.firstName ? user.firstName[0].toUpperCase() : 'U';
                const isVerified = idx % 2 === 1; // mock verification for design since it's not in db

                return (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {initial}
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-gray-800">{name}</div>
                           <div className="text-[11px] text-gray-500">{getHoursAgo(user.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{user.mobilePrefix}{user.mobile}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">Individual</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                           <FaUser size={10} /> {user.role === 'freelancer' ? 'Freelancer' : 'User'}
                        </span>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                             <FaCheckCircle size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-200">
                             <FaExclamationTriangle size={10} /> Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/admin/customers/${user._id}`} className="text-[13px] font-semibold text-[#006fee] hover:text-blue-700 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
