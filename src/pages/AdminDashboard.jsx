import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { FaHourglassHalf, FaFileInvoice, FaCheckCircle, FaTimesCircle, FaHardHat, FaExclamationTriangle, FaFlagCheckered } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'x-auth-token': token };
        
        const [statsRes, projectsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/admin/projects/stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/admin/projects`, { headers })
        ]);
        
        if (statsRes.ok && projectsRes.ok) {
          setStats(await statsRes.json());
          setProjects(await projectsRes.json());
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Requested', count: stats?.requested || 0, icon: <FaHourglassHalf className="text-amber-500" /> },
    { label: 'Quoted', count: stats?.quoted || 0, icon: <FaFileInvoice className="text-blue-500" /> },
    { label: 'Approved', count: stats?.approved || 0, icon: <FaCheckCircle className="text-green-500" /> },
    { label: 'Rejected', count: stats?.rejected || 0, icon: <FaTimesCircle className="text-red-500" /> },
    { label: 'Ongoing', count: stats?.ongoing || 0, icon: <FaHardHat className="text-yellow-500" /> },
    { label: 'Reported', count: stats?.reported || 0, icon: <FaExclamationTriangle className="text-yellow-400" /> },
    { label: 'Completed', count: stats?.completed || 0, icon: <FaFlagCheckered className="text-gray-600" /> },
  ];

  const filters = ['All', 'Requested', 'Quoted', 'Approved', 'Rejected', 'Ongoing', 'Reported', 'Completed'];

  const getFilterCategory = (status) => {
    switch (status) {
      case 'Pending Quote':
      case 'Requested':
        return 'Requested';
      case 'Quote Ready':
      case 'Quoted':
        return 'Quoted';
      case 'Approved':
        return 'Approved';
      case 'Rejected':
        return 'Rejected';
      case 'In Progress':
      case 'QA Review':
      case 'Delivered':
      case 'Under Review':
      case 'Revision Requested':
      case 'Ongoing':
        return 'Ongoing';
      case 'Reported':
        return 'Reported';
      case 'Completed':
        return 'Completed';
      default:
        return 'All';
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter !== 'All' && getFilterCategory(p.status) !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const customerName = `${p.userId?.firstName} ${p.userId?.lastName}`.toLowerCase();
      const title = p.title.toLowerCase();
      return customerName.includes(s) || title.includes(s) || p.userId?.email?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans">
      
      {/* Purple Banner */}
      <div className="bg-[#7c3aed] rounded-xl p-8 text-white mb-6 shadow-lg shadow-purple-500/20">
        <h1 className="text-3xl font-bold mb-1">Quotation Dashboard</h1>
        <p className="text-purple-200 text-sm mb-8">{stats?.totalQuotations || 0} total quotations</p>
        
        <div className="flex flex-wrap gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white text-gray-800 rounded-lg py-3 px-4 flex-1 min-w-[120px] shadow-sm flex items-center gap-3">
              <div className="text-xl shrink-0">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                <span className="text-lg font-bold leading-tight">{stat.count}</span>
              </div>
            </div>
          ))}
        </div>
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
        
        <div className="relative w-full md:w-72 px-2 pb-2 md:pb-0">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none md:pb-0 pb-2">
            <BiSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            placeholder="Search projects, customers, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">No</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map((project, idx) => {
                const customerName = project.userId ? `${project.userId.firstName} ${project.userId.lastName}` : 'Unknown';
                const createdDate = new Date(project.createdAt).toLocaleDateString('en-US');
                const isRequested = project.status === 'Requested' || project.status === 'Pending Quote';
                
                return (
                  <tr key={project._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-gray-800">{project.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{createdDate}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-700">{customerName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{project.userId?.email || 'N/A'}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{project.userId?.mobilePrefix} {project.userId?.mobile}</div>
                    </td>
                    <td className="py-4 px-6">
                      <select className="bg-white border border-gray-200 text-gray-700 text-xs rounded px-2 py-1.5 font-medium cursor-pointer focus:outline-none">
                        <option>⏳ Not Yet Received</option>
                        <option>✅ Received</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      {isRequested ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fff8ea] text-[#d97706] text-[11px] font-bold border border-[#fde68a]">
                          <FaHourglassHalf size={10} /> Requested
                        </span>
                      ) : project.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-[11px] font-bold border border-gray-200">
                          <FaFlagCheckered size={10} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-200">
                           {project.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        to={`/admin/quotes/${project._id}`}
                        className="text-[13px] font-semibold text-[#7c3aed] hover:text-purple-700 transition-colors"
                      >
                        {isRequested ? 'Prepare Quote' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-sm">
                    No projects found.
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
