import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { FaHourglassHalf, FaFileInvoice, FaCheckCircle, FaTimesCircle, FaHardHat, FaExclamationTriangle, FaFlagCheckered } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboard() {
  const socket = useSocket();
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
    
    if (socket) {
      socket.on('newProject', fetchData);
      socket.on('projectUpdated', fetchData);
      
      return () => {
        socket.off('newProject', fetchData);
        socket.off('projectUpdated', fetchData);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Requested', count: stats?.requested || 0, borderColor: 'border-yellow-400', subtitle: 'Awaiting quote' },
    { label: 'Quoted', count: stats?.quoted || 0, borderColor: 'border-blue-400', subtitle: 'Pending approval' },
    { label: 'Approved', count: stats?.approved || 0, borderColor: 'border-indigo-400', subtitle: 'Ready to start' },
    { label: 'Ongoing', count: stats?.ongoing || 0, borderColor: 'border-purple-400', subtitle: 'In progress now' },
    { label: 'Completed', count: stats?.completed || 0, borderColor: 'border-green-400', subtitle: 'All delivered' },
    { label: 'Reported', count: stats?.reported || 0, borderColor: 'border-orange-400', subtitle: 'Needs attention' },
    { label: 'Rejected', count: stats?.rejected || 0, borderColor: 'border-red-400', subtitle: 'Declined' },
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
      case 'Under Review':
      case 'Revision Requested':
      case 'Ongoing':
        return 'Ongoing';
      case 'Reported':
        return 'Reported';
      case 'Completed':
      case 'Delivered':
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
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Quotation Dashboard</h1>
        <p className="text-gray-500 text-sm">{stats?.totalQuotations || 0} total quotations across all users</p>
      </div>
      
      {/* Overview Widgets */}
      <div className="mb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
                      ) : (project.status === 'Completed' || project.status === 'Delivered') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-[11px] font-bold border border-gray-200">
                          <FaFlagCheckered size={10} /> {project.status}
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
