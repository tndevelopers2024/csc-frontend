import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFolder, FiActivity, FiCheck, FiClock, FiArrowDown, FiUsers, FiShield, FiHeadphones, FiChevronRight } from 'react-icons/fi';

export default function Projects() {
  const navigate = useNavigate();

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b] mb-2">My Projects</h1>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
            Upload your scan data and tell us what you need. Our engineering team will review and send you a quotation.<br className="hidden sm:block" />
            Track every Scan-to-CAD project from upload to delivery.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/new-project')} 
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-sm transition-colors flex items-center shrink-0 w-max"
        >
          <FiPlus className="mr-2" />
          New Project
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Active Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <FiActivity className="text-xl text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Active Projects</p>
              <div className="text-3xl font-bold text-gray-900 leading-tight">0</div>
              <p className="text-xs font-semibold text-blue-500">In Progress</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-xl" />
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <FiCheck className="text-xl text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Completed Projects</p>
              <div className="text-3xl font-bold text-gray-900 leading-tight">0</div>
              <p className="text-xs font-semibold text-green-500">All Time</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-xl" />
        </div>

        {/* CAD Hours Left */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <FiClock className="text-xl text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">CAD Hours Left</p>
              <div className="text-3xl font-bold text-gray-900 leading-tight">10:00</div>
              <p className="text-xs font-semibold text-purple-500">Of 10:00 Hours</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-xl" />
        </div>

      </div>

      {/* Empty State Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-28 flex flex-col items-center justify-center text-center mb-8 relative z-10">
        <FiFolder className="text-5xl text-blue-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No projects found</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
          You haven't started any Scan-to-CAD projects yet.<br />Upload your first scan to get started.
        </p>
        <button 
          onClick={() => navigate('/dashboard/new-project')} 
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-md shadow-sm transition-colors"
        >
          Start Your First Project
        </button>
      </div>

      {/* Bottom Value Props */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 pt-10 pb-12 -mt-16 z-0 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-8">
          
          {/* Prop 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FiArrowDown className="text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Any Scan Data</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[140px]">
              Upload STL, OBJ, PLY, Mesh, Point Cloud and more.
            </p>
          </div>

          {/* Prop 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <FiUsers className="text-green-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Global Engineering Team</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[160px]">
              Dedicated engineers working across our global centers.
            </p>
          </div>

          {/* Prop 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <FiShield className="text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">
              Your data is protected with industry-standard security.
            </p>
          </div>

          {/* Prop 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <FiClock className="text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">On-Time Delivery</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">
              Transparent process and reliable turnaround times.
            </p>
          </div>

          {/* Prop 5 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FiHeadphones className="text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[140px]">
              We're here to help you anytime, anywhere.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
