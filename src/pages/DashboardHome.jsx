import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { FiFolder, FiArrowRight, FiGift } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

export default function DashboardHome() {
  const { user, openBuyHoursModal } = useOutletContext();
  const navigate = useNavigate();
  const socket = useSocket();

  const [stats, setStats] = useState({
    totalOrders: 0,
    quotesPending: 0,
    activeProjects: 0,
    completed: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch stats
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        // Fetch projects
        const projRes = await fetch(`${import.meta.env.VITE_API_URL}/projects`, { headers });
        if (projRes.ok) {
          const projData = await projRes.json();
          setRecentProjects(projData.slice(0, 3)); // top 3
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    if (socket) {
      socket.on('projectUpdated', fetchData);
      socket.on('newProject', fetchData);
      
      return () => {
        socket.off('projectUpdated', fetchData);
        socket.off('newProject', fetchData);
      };
    }
  }, [socket]);

  const renderStatusTag = (status) => {
    if (status === 'Completed') return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-[11px] font-bold">Completed</span>;
    if (status === 'Approved' || status === 'In Progress') return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-[11px] font-bold">Modeling</span>;
    if (status === 'Pending Quote' || status === 'Quote Ready') return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded text-[11px] font-bold">Quoting</span>;
    return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[11px] font-bold">{status}</span>;
  };

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#1e293b] mb-6">
        Welcome {user?.firstName || 'User'}
      </h1>

      {/* Banner */}
      <div className="bg-[#1f2937] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          {user?.freeHoursRemaining > 0 ? (
            <>
              <div className="text-xl flex items-center justify-center"><FiGift /></div>
              <span className="text-white font-semibold text-base">Free {user.freeHoursRemaining}-hour offer active</span>
            </>
          ) : (
            <span className="text-white font-semibold text-base">CAD Engineering Services</span>
          )}
        </div>
        <button onClick={openBuyHoursModal} className="bg-[#facc15] hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2.5 rounded text-sm transition-colors uppercase tracking-wide">
          Buy More CAD Hours
        </button>
      </div>

      {/* Overview */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-5 border border-blue-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Total Orders</h3>
            <div className="text-4xl font-bold text-gray-900">{loading ? '-' : stats.totalOrders}</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-5 border border-yellow-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Quotes Pending</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">{loading ? '-' : stats.quotesPending}</div>
            <p className="text-xs text-gray-400 font-medium">Awaiting your approval</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-5 border border-purple-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Active Projects</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">{loading ? '-' : stats.activeProjects}</div>
            <p className="text-xs text-gray-400 font-medium">In progress now</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-5 border border-green-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Completed</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">{loading ? '-' : stats.completed}</div>
            <p className="text-xs text-gray-400 font-medium">All delivered</p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-xl p-5 border border-[#c49a75] shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Remaining</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">{user?.freeHoursRemaining || 0}</div>
            <p className="text-xs text-gray-400 font-medium">CAD Hours</p>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/dashboard/new-project')} className="bg-[#3b82f6] hover:bg-blue-600 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] text-white rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors">
            Upload new scan
          </button>
          <button onClick={() => navigate('/dashboard/quotations')} className="bg-white border border-gray-200 shadow-sm rounded-lg px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View quotations
          </button>
          <button onClick={() => navigate('/dashboard/projects')} className="bg-white border border-gray-200 shadow-sm rounded-lg px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View projects
          </button>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Recent Projects */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent projects</h2>
            <Link to="/dashboard/projects" className="text-sm text-blue-500 font-semibold hover:underline">View all projects &rarr;</Link>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <FiFolder className="text-[40px] text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No active projects</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
                Upload your first scan to begin the Scan-to-CAD process. Our engineers will review it and provide a quote within hours.
              </p>
              <button onClick={() => navigate('/dashboard/new-project')} className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm transition-colors">
                Start Your First Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-gray-900">{project.title}</h3>
                    {renderStatusTag(project.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {project.appType || 'Scan'} output • Submitted {new Date(project.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  
                  {(project.status === 'Completed' || project.status === 'Delivered') ? (
                    <>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2 mt-2">
                        <span>Completed</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                        <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2 mt-2">
                        <span>{project.status === 'Quote Ready' ? 'Quote pending approval' : 'CAD modeling in progress'}</span>
                        <span>{project.status === 'Quote Ready' ? '0%' : '65%'}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                        <div className={`bg-green-500 h-1.5 rounded-full ${project.status === 'Quote Ready' ? 'w-[5%]' : 'w-[65%]'}`}></div>
                      </div>
                    </>
                  )}
                  
                  <div className="mt-2">
                    <button onClick={() => navigate(`/dashboard/projects/${project._id}`)} className="text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-md px-3 py-1.5 flex items-center transition-colors">
                      View Project <FiArrowRight className="ml-1.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="lg:w-1/3">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent notifications</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-4">
            
            {loading ? (
              <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
            ) : recentProjects.filter(p => p.status === 'Quote Ready').length > 0 ? (
              recentProjects.filter(p => p.status === 'Quote Ready').slice(0, 2).map(p => (
                <div key={'notif-'+p._id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-1 border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Quote ready — {p.title}</h4>
                    <p className="text-xs text-gray-500 mb-3">Estimated 12 hrs • $840 • Free 2h applied</p>
                    <button onClick={() => navigate('/dashboard/quotations')} className="text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-md px-3 py-1.5 flex items-center transition-colors">
                      Review & Approve <FiArrowRight className="ml-1.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No new notifications.</p>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
