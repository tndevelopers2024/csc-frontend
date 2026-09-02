import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFolder, FiActivity, FiCheck, FiClock, FiChevronRight, FiMoreVertical, FiDownload, FiStar, FiUpload, FiFileText, FiUsers, FiSearch, FiGrid, FiMenu, FiBox } from 'react-icons/fi';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch projects
        const projRes = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projs = await projRes.json();
        
        // Fetch user for free hours
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        
        setProjects(projs);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const activeProjects = projects.filter(p => !['Completed', 'Cancelled', 'Delivered'].includes(p.status)).length;
  const completedProjects = projects.filter(p => ['Completed', 'Delivered'].includes(p.status)).length;
  
  const freeHours = user?.freeHoursRemaining || 0;
  const totalFreeHours = 3; // Hardcoded default based on feature logic
  
  // Timeline steps
  const steps = [
    { label: 'Upload' },
    { label: 'Review' },
    { label: 'Quote' },
    { label: 'Approved' },
    { label: 'CAD Production' },
    { label: 'QA Review' },
    { label: 'Delivered' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending Quote': return 0; // Upload
      case 'Under Review': return 1; // Review
      case 'Quote Ready': return 2; // Quote
      case 'Revision Requested': return 2;
      case 'Approved': return 3; // Approved
      case 'In Progress': return 4; // CAD
      case 'QA Review': return 5; // QA
      case 'Delivered': return 6; // Delivered
      case 'Completed': return 6;
      default: return 0;
    }
  };

  const getProgressPercent = (status) => {
    switch (status) {
      case 'Pending Quote': return 15;
      case 'Under Review': return 30;
      case 'Quote Ready': return 45;
      case 'Revision Requested': return 45;
      case 'Approved': return 60;
      case 'In Progress': return 70;
      case 'QA Review': return 90;
      case 'Delivered': return 100;
      case 'Completed': return 100;
      default: return 10;
    }
  };

  return (
    <div className="max-w-8xl mx-auto pb-12 font-sans">
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
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center shrink-0 w-max"
        >
          <FiPlus className="mr-2 text-lg" />
          New Project
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Active Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiActivity className="text-xl text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Active Projects</p>
              <div className="text-2xl font-bold text-gray-900 leading-tight">{loading ? '-' : activeProjects}</div>
              <p className="text-[10px] font-bold text-blue-500 mt-1">In Progress</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-lg" />
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <FiCheck className="text-xl text-green-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Completed Projects</p>
              <div className="text-2xl font-bold text-gray-900 leading-tight">{loading ? '-' : completedProjects}</div>
              <p className="text-[10px] font-bold text-green-500 mt-1">All Time</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-lg" />
        </div>

        {/* CAD Hours Left */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FiClock className="text-xl text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">CAD Hours Left</p>
              <div className="text-2xl font-bold text-gray-900 leading-tight">{loading ? '-' : `${String(Math.floor(freeHours)).padStart(2, '0')}:00`}</div>
              <p className="text-[10px] font-bold text-purple-500 mt-1">Available to use</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-lg" />
        </div>

        {/* Avg Turnaround Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <FiActivity className="text-xl text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Avg. Turnaround Time</p>
              <div className="text-2xl font-bold text-gray-900 leading-tight">48 hrs</div>
              <p className="text-[10px] font-bold text-orange-500 mt-1">This Month</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-300 text-lg" />
        </div>

      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by project name or ID..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-blue-500 min-w-[140px]">
            <option>All Status</option>
          </select>
          <select className="px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-blue-500 min-w-[160px]">
            <option>All Deliverables</option>
          </select>
          <select className="px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-blue-500 min-w-[140px]">
            <option>Newest First</option>
          </select>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-100/50 text-[#3b82f6]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiGrid />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-100/50 text-[#3b82f6]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-28 flex flex-col items-center justify-center text-center">
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
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : "flex flex-col gap-6"}>
          {projects.map(project => {
            const isDelivered = project.status === 'Delivered' || project.status === 'Completed';
            const themeColor = isDelivered ? 'green' : 'blue';
            const hexColor = isDelivered ? '#10b981' : '#3b82f6';
            const bgClass = isDelivered ? 'bg-green-500' : 'bg-blue-500';
            const lightBgClass = isDelivered ? 'bg-green-50' : 'bg-blue-50';
            const textClass = isDelivered ? 'text-green-600' : 'text-blue-500';
            
            const currentIdx = getStepIndex(project.status);

            return (
              <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all overflow-hidden">
                
                {viewMode === 'grid' ? (
                  <>
                    <div className="p-6 flex flex-col h-full">
                      {/* Top: Thumbnail & Info */}
                      <div className="flex gap-5 mb-8">
                        {/* Thumbnail */}
                        <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                          {project.scanFiles && project.scanFiles.length > 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl"><FiFileText /></div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl"><FiBox /></div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{project.title}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {isDelivered ? <FiStar className="text-gray-300" /> : <FiStar className="text-yellow-400 fill-current" />}
                              <FiMoreVertical className="text-gray-400 ml-1 cursor-pointer" />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-xs text-gray-500 font-medium">Project ID: CSC-{project._id.substring(project._id.length - 8).toUpperCase()}</p>
                            <FiFileText className="text-gray-400 text-xs" />
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-5">
                            {project.appType ? (
                              <span className={`px-2 py-1 ${lightBgClass} ${textClass} rounded text-[10px] font-bold border ${isDelivered ? 'border-green-100' : 'border-blue-100'} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-sm ${bgClass}`}></span> {project.appType}
                              </span>
                            ) : (
                              <span className={`px-2 py-1 ${lightBgClass} ${textClass} rounded text-[10px] font-bold border ${isDelivered ? 'border-green-100' : 'border-blue-100'} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-sm ${bgClass}`}></span> Parametric CAD
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                              {project.cadOutput || 'STEP'}
                            </span>
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                              SolidWorks
                            </span>
                          </div>
                          
                          <div className="flex gap-8">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiClock /> REQUESTED</p>
                              <p className="text-xs font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiUsers /> ENGINEER</p>
                              <p className="text-xs font-bold text-gray-900">A. Kumar</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                {isDelivered ? <FiCheck /> : <FiClock />} {isDelivered ? 'DELIVERED' : 'ETA'}
                              </p>
                              <p className="text-xs font-bold text-gray-900">June 8, 2026</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">2:30 PM GMT+1</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Middle: Progress */}
                      <div className="mt-auto">
                        <div className={`inline-block px-2.5 py-1 ${lightBgClass} ${textClass} rounded text-[9px] font-bold uppercase tracking-wider mb-4`}>
                          {project.status}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-[11px] font-bold text-gray-600 mb-2">{isDelivered ? 'Delivered Successfully' : 'CAD Production'}</p>
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-gray-900 w-12">{getProgressPercent(project.status)}%</h4>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${getProgressPercent(project.status)}%` }}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Timeline Dots */}
                        <div className="flex justify-between relative mt-6 px-2 pb-2">
                          <div className="absolute top-[12px] left-[20px] right-[20px] h-[2px] bg-gray-100 -z-10"></div>
                          {steps.map((step, i) => {
                            const isCompleted = i < currentIdx || isDelivered;
                            const isCurrent = i === currentIdx && !isDelivered;
                            
                            let dotClass = "bg-gray-100 text-gray-300 border-2 border-white";
                            let icon = null;
                            
                            if (isCompleted) {
                              dotClass = `${bgClass} text-white border-2 border-white shadow-sm`;
                              icon = <FiCheck strokeWidth={3} className="text-[10px]" />;
                            } else if (isCurrent) {
                              dotClass = `bg-white border-[3px] border-[${hexColor}] ${textClass}`;
                              icon = <div className={`w-2 h-2 rounded-full ${bgClass}`}></div>;
                            }
                            
                            return (
                              <div key={i} className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 z-10 ${dotClass}`}>
                                  {icon}
                                </div>
                                <span className={`text-[7px] font-bold uppercase tracking-widest text-center ${isCompleted || isCurrent ? textClass : 'text-gray-400'}`} style={{ maxWidth: '45px', lineHeight: '1.2' }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-gray-100 bg-gray-50/50 mt-auto flex flex-col">
                      {isDelivered ? (
                        <>
                          <button 
                            onClick={() => {
                              if (project.completedFiles && project.completedFiles.length > 0) {
                                window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${project.completedFiles[0].filename}`, '_blank');
                              } else {
                                navigate(`/dashboard/projects/${project._id}`);
                              }
                            }}
                            className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100">
                            Download CAD
                            <FiDownload className="text-[#10b981] text-base" />
                          </button>
                          <button 
                            onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                            className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                            View Report
                            <FiFileText className="text-gray-400 text-base" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => navigate(`/dashboard/projects/${project._id}`)} className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100">
                            View Timeline
                            <FiChevronRight className="text-[#3b82f6] text-base" />
                          </button>
                          <button className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                            Upload More Files
                            <FiUpload className="text-gray-400 text-base" />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col xl:flex-row p-6 gap-8 w-full">
                    {/* List Left Column (Info + Actions) */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex gap-6 mb-8">
                        {/* Thumbnail */}
                        <div className="w-[140px] h-[140px] bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                          {project.scanFiles && project.scanFiles.length > 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"><FiFileText /></div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"><FiBox /></div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{project.title}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {isDelivered ? <FiStar className="text-gray-300" /> : <FiStar className="text-yellow-400 fill-current" />}
                              <FiMoreVertical className="text-gray-400 ml-1 cursor-pointer" />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm text-gray-500 font-medium">Project ID: CSC-{project._id.substring(project._id.length - 8).toUpperCase()}</p>
                            <FiFileText className="text-gray-400 text-sm" />
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.appType ? (
                              <span className={`px-3 py-1.5 ${lightBgClass} ${textClass} rounded text-[11px] font-bold border ${isDelivered ? 'border-green-100' : 'border-blue-100'} flex items-center gap-1.5`}>
                                <span className={`w-2 h-2 rounded-sm ${bgClass}`}></span> {project.appType}
                              </span>
                            ) : (
                              <span className={`px-3 py-1.5 ${lightBgClass} ${textClass} rounded text-[11px] font-bold border ${isDelivered ? 'border-green-100' : 'border-blue-100'} flex items-center gap-1.5`}>
                                <span className={`w-2 h-2 rounded-sm ${bgClass}`}></span> Parametric CAD
                              </span>
                            )}
                            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded text-[11px] font-bold border border-gray-200">
                              {project.cadOutput || 'STEP'}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded text-[11px] font-bold border border-gray-200">
                              SolidWorks
                            </span>
                          </div>
                          
                          <div className="flex gap-10">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiClock /> REQUESTED</p>
                              <p className="text-sm font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiUsers /> ENGINEER</p>
                              <p className="text-sm font-bold text-gray-900">A. Kumar</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                {isDelivered ? <FiCheck /> : <FiClock />} {isDelivered ? 'DELIVERED' : 'ETA'}
                              </p>
                              <p className="text-sm font-bold text-gray-900">June 8, 2026</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">2:30 PM GMT+1</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        {isDelivered ? (
                          <>
                            <button 
                              onClick={() => {
                                if (project.completedFiles && project.completedFiles.length > 0) {
                                  window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${project.completedFiles[0].filename}`, '_blank');
                                } else {
                                  navigate(`/dashboard/projects/${project._id}`);
                                }
                              }}
                              className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-md transition-colors text-sm text-center flex-1 flex justify-center items-center gap-2 shadow-sm">
                              <FiDownload /> Download CAD
                            </button>
                            <button 
                              onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                              className="bg-white border border-gray-200 hover:border-[#10b981] hover:text-[#10b981] text-gray-700 font-semibold py-2.5 px-6 rounded-md transition-colors text-sm text-center flex-1 flex justify-center items-center gap-2 shadow-sm">
                              <FiFileText /> View Report
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => navigate(`/dashboard/projects/${project._id}`)} className="bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 font-semibold py-2.5 px-6 rounded-md transition-colors text-sm text-center flex-1 flex justify-center items-center gap-2 shadow-sm">
                              View Timeline <FiChevronRight />
                            </button>
                            <button className="bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 font-semibold py-2.5 px-6 rounded-md transition-colors text-sm text-center flex-1 flex justify-center items-center gap-2 shadow-sm">
                              <FiUpload /> Upload More Files
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* List Right Column (Progress + Timeline) */}
                    <div className="w-full xl:w-[420px] flex flex-col pt-8 xl:pt-0 xl:pl-10 xl:border-l border-gray-100 justify-center">
                      <div className={`inline-block px-3 py-1.5 ${lightBgClass} ${textClass} rounded text-[10px] font-bold uppercase tracking-wider mb-6 w-max`}>
                        {project.status}
                      </div>
                      
                      <div className="mb-8">
                        <p className="text-xs font-bold text-gray-600 mb-3">{isDelivered ? 'Delivered Successfully' : 'CAD Production'}</p>
                        <div className="flex items-center gap-4">
                          <h4 className="text-3xl font-bold text-gray-900 w-16">{getProgressPercent(project.status)}%</h4>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${getProgressPercent(project.status)}%` }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline Dots */}
                      <div className="flex justify-between relative px-2 pb-2">
                        <div className="absolute top-[14px] left-[20px] right-[20px] h-[2px] bg-gray-100 -z-10"></div>
                        {steps.map((step, i) => {
                          const isCompleted = i < currentIdx || isDelivered;
                          const isCurrent = i === currentIdx && !isDelivered;
                          
                          let dotClass = "bg-gray-100 text-gray-300 border-[3px] border-white";
                          let icon = null;
                          
                          if (isCompleted) {
                            dotClass = `${bgClass} text-white border-[3px] border-white shadow-sm`;
                            icon = <FiCheck strokeWidth={3} className="text-xs" />;
                          } else if (isCurrent) {
                            dotClass = `bg-white border-[4px] border-[${hexColor}] ${textClass}`;
                            icon = <div className={`w-2.5 h-2.5 rounded-full ${bgClass}`}></div>;
                          }
                          
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 z-10 ${dotClass}`}>
                                {icon}
                              </div>
                              <span className={`text-[8px] font-bold uppercase tracking-widest text-center ${isCompleted || isCurrent ? textClass : 'text-gray-400'}`} style={{ maxWidth: '45px', lineHeight: '1.2' }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
