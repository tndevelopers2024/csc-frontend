import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FiFolder } from 'react-icons/fi';

export default function DashboardHome() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#1e293b] mb-6">
        Welcome {user?.firstName || 'User'}
      </h1>

      {/* Banner */}
      <div className="bg-[#1f2937] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="text-xl">🎁</div>
          <span className="text-white font-semibold text-base">Free 3-hour offer active</span>
        </div>
        <button className="bg-[#facc15] hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2.5 rounded text-sm transition-colors uppercase tracking-wide">
          Buy More CAD Hours
        </button>
      </div>

      {/* Overview */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-5 border border-blue-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Total Requests</h3>
            <div className="text-4xl font-bold text-gray-900">0</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-5 border border-yellow-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Quotes Pending</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-400 font-medium">Awaiting your approval</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-5 border border-purple-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Active Projects</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-400 font-medium">In progress now</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-5 border border-green-400 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Completed</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-400 font-medium">All delivered</p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-xl p-5 border border-[#c49a75] shadow-sm flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Remaining</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">3</div>
            <p className="text-xs text-gray-400 font-medium">CAD Hours</p>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/dashboard/new-project')} className="bg-white border border-gray-200 shadow-sm rounded-lg px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
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
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent projects</h2>
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
        </div>

        {/* Recent Notifications */}
        <div className="lg:w-1/3">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent notifications</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-center min-h-[160px]">
            <p className="text-sm text-gray-500">No new notifications.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
