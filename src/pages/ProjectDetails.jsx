import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiFileText, FiMail, FiCheck, FiUser, FiDownload, 
  FiSettings, FiClock, FiAlertTriangle, FiSend, FiZoomIn, FiRotateCw, FiX
} from 'react-icons/fi';
import { BiScan } from 'react-icons/bi';
import StlViewer from '../components/StlViewer';
import ApprovalModal from '../components/ApprovalModal';
import RevisionModal from '../components/RevisionModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [issueText, setIssueText] = useState('');

  // Modals state
  const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
  const [isRevisionModalOpen, setRevisionModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          console.error('Project not found or error');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto pb-12 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const shortId = `#CSC${project._id.substring(project._id.length - 7).toUpperCase()}`;

  const isToday = (dateObj) => {
    const today = new Date();
    return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return isToday(d) ? `${dateLabel} (Today)` : dateLabel;
  };

  const getTimelineContent = (status) => {
    switch (status) {
      case 'Pending Quote': return { title: 'RFQ Submitted', desc: 'Initial CAD files and specifications uploaded by client.' };
      case 'Under Review': return { title: 'Reviewing Files', desc: 'Technical team assessing scan feasibility and mesh density requirements.' };
      case 'Quote Ready': return { title: 'Quote ready', desc: 'Proposal generated based on High-Accuracy 3D scanning protocols.' };
      case 'Revision Requested': return { title: 'Revision Requested', desc: 'Quote Revision has been requested.' };
      case 'Approved': return { title: 'Quote Approved', desc: 'Customer has approved the quotation.' };
      case 'In Progress': return { title: 'CAD Production', desc: 'Engineering team is working on the project.' };
      case 'QA Review': return { title: 'QA Review', desc: 'Project is undergoing quality assurance before final delivery.' };
      case 'Delivered': return { title: 'Project Delivered', desc: 'The final files have been delivered to the customer.' };
      default: return { title: status, desc: `Project moved to ${status}.` };
    }
  };

  const history = project.statusHistory ? [...project.statusHistory] : [];
  if (history.length === 0) {
    history.push({ status: 'Pending Quote', date: project.createdAt });
    if (project.status !== 'Pending Quote') {
      history.push({ status: project.status, date: new Date() });
    }
  }
  
  const timeline = history.filter((h, idx, arr) => idx === 0 || h.status !== arr[idx-1].status);

  const stlFile = project.scanFiles?.find(f => f.originalname.toLowerCase().endsWith('.stl') || f.filename.toLowerCase().endsWith('.stl'));
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  const stlUrl = stlFile ? `${baseUrl}/uploads/${stlFile.filename}` : null;

  // Handlers for modals
  const updateProjectStatus = async (newStatus, file = null) => {
    try {
      const token = localStorage.getItem('token');
      let options = {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (file) {
        const formData = new FormData();
        formData.append('status', newStatus);
        formData.append('poFile', file);
        options.body = formData;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify({ status: newStatus });
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project._id}/status`, options);
      
      if (res.ok) {
        const data = await res.json();
        setProject(data.project); // Update local state with the returned project
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update project status.');
    }
  };

  const handleApprovePO = async (file) => {
    console.log("PO Submitted:", file);
    setApprovalModalOpen(false);
    await updateProjectStatus('Approved', file);
  };

  const handleApprovePayment = async () => {
    console.log("Proceeding to payment");
    setApprovalModalOpen(false);
    await updateProjectStatus('Approved');
  };

  const handleRevisionSubmit = async (data) => {
    console.log("Revision requested:", data);
    setRevisionModalOpen(false);
    await updateProjectStatus('Revision Requested');
  };


  // --- RENDER QUOTE PHASE LAYOUT (Pre-approval) ---
  const renderQuotePhaseLayout = () => {
    return (
      <div className="max-w-7xl mx-auto pb-12 font-sans bg-[#f9fafb] min-h-screen -mt-6 pt-6 px-4">
        
        {/* Modals */}
        <ApprovalModal 
          isOpen={isApprovalModalOpen} 
          onClose={() => setApprovalModalOpen(false)} 
          project={project} 
          onApprovePO={handleApprovePO} 
          onApprovePayment={handleApprovePayment} 
        />
        <RevisionModal 
          isOpen={isRevisionModalOpen} 
          onClose={() => setRevisionModalOpen(false)} 
          onSubmitRevision={handleRevisionSubmit} 
        />

        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">
              PROJECT ID: {project._id.substring(project._id.length - 8).toUpperCase()}
              {project.status === 'Quote Ready' ? (
                <span className="ml-4 px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 flex items-center gap-1 rounded font-bold normal-case tracking-normal">
                  <FiCheck strokeWidth={3} /> Quote ready
                </span>
              ) : project.status === 'Revision Requested' ? (
                <span className="ml-4 px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1 rounded font-bold normal-case tracking-normal">
                  <FiAlertTriangle strokeWidth={3} /> Revision Requested
                </span>
              ) : project.status === 'Rejected' ? (
                <span className="ml-4 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 rounded font-bold normal-case tracking-normal">
                  <FiX strokeWidth={3} /> PO Rejected
                </span>
              ) : (
                <span className="ml-4 px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-1 rounded font-bold normal-case tracking-normal">
                  <FiClock strokeWidth={3} /> {project.status}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Project Details — <br/> {project.title}
            </h1>
          </div>

          <div className="flex flex-col gap-3 w-[320px]">
            {['Quote Ready', 'Revision Requested', 'Rejected'].includes(project.status) && (
              <>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setApprovalModalOpen(true)}
                    className="flex-1 bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-1"
                  >
                    <FiCheck /> Approve & Start
                  </button>
                  <button 
                    onClick={() => setRevisionModalOpen(true)}
                    className="flex-1 bg-[#f97316] hover:bg-orange-600 text-white text-xs font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-1"
                  >
                    <FiArrowLeft className="rotate-[135deg]" /> Request Revision
                  </button>
                </div>
                <button 
                  onClick={() => updateProjectStatus('Rejected')}
                  className="w-full bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-1"
                >
                  <FiX /> Reject Quote
                </button>
              </>
            )}
            
            {project.quotationFiles && project.quotationFiles.length > 0 && (
              <button 
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                  window.open(`${baseUrl}/uploads/${project.quotationFiles[project.quotationFiles.length - 1].filename}`, '_blank');
                }}
                className="w-full bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 text-xs font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-1 mt-1"
              >
                <FiDownload /> Download Quote PDF
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#1e293b] mb-6">Project Specifications</h2>
              <div className="border-t border-gray-100 pt-6 grid grid-cols-3 gap-y-8 gap-x-4">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Application</h3>
                  <p className="text-sm font-bold text-gray-900">{project.appType || 'Reverse Engineering'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Industry</h3>
                  <p className="text-sm font-bold text-gray-900">{project.industry || 'Automotive'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Required Output</h3>
                  <p className="text-sm font-bold text-gray-900">{project.cadOutput || 'STEP'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Accuracy</h3>
                  <p className="text-sm font-bold text-gray-900">{project.accuracy || 'High ±0.05mm'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Part Size</h3>
                  <p className="text-sm font-bold text-gray-900">{project.partSize || 'Medium'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Material</h3>
                  <p className="text-sm font-bold text-gray-900">Aluminum</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <span className="text-xs font-bold text-blue-500">CAD Reference Model</span>
                <div className="flex items-center gap-3 text-gray-500">
                  <button className="hover:text-gray-900"><FiZoomIn size={16} /></button>
                  <button className="hover:text-gray-900"><FiRotateCw size={16} /></button>
                </div>
              </div>
              <div className="flex-1 bg-[#cfd4d9] relative flex items-center justify-center">
                {stlUrl ? <StlViewer url={stlUrl} /> : <p className="text-gray-500 font-bold text-sm">No 3D Preview Available</p>}
                <div className="absolute bottom-4 left-4 bg-[#3b82f6] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-sm">
                  ISO-METRIC VIEW
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-[320px] flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e293b] mb-6">Project Activity</h2>
              <div className="relative pl-3">
                <div className="absolute top-2 bottom-2 left-[19px] w-px bg-gray-200 z-0"></div>
                {timeline.map((item, idx) => {
                  const content = getTimelineContent(item.status);
                  const isLast = idx === timeline.length - 1;
                  
                  return (
                    <div key={idx} className={`relative z-10 flex items-start gap-4 ${isLast ? '' : 'mb-6'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 outline outline-4 ${isLast ? 'bg-[#3b82f6] outline-blue-50' : 'bg-gray-200 outline-white'}`}></div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase ${isLast ? 'text-[#3b82f6]' : 'text-gray-400'}`}>{formatDateLabel(item.date)}</span>
                        <h4 className="text-xs font-bold text-gray-900 mt-0.5 mb-1">{content.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{content.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {project.engineer && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-[#1e293b] mb-4">Project Lead</h2>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gray-300 rounded-md relative shrink-0">
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{project.engineer}</h4>
                    <p className="text-[10px] text-gray-500 mb-1.5">Lead Metrology Engineer</p>
                    <div className="flex gap-1.5">
                      <span className="bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Senior Specialist</span>
                      <span className="bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">6+ Years Exp</span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-white border border-blue-400 text-blue-500 hover:bg-blue-50 font-bold py-2 rounded-lg text-xs transition-colors">
                  View Specialist Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER ACTIVE PROJECT LAYOUT (Post-approval) ---
  const renderActiveProjectLayout = () => {
    // Map DB status to timeline index
    const getStepIndex = (status) => {
      if (['Pending Quote', 'Under Review'].includes(status)) return 0;
      if (['Quote Ready', 'Revision Requested'].includes(status)) return 1;
      if (['Approved'].includes(status)) return 2;
      if (['In Progress', 'QA Review'].includes(status)) return 3;
      if (['Delivered', 'Completed'].includes(status)) return 4;
      return 0;
    };

    const currentIdx = getStepIndex(project.status);
    
    // Custom Status Badge formatting based on screenshot
    let badgeClass = "bg-yellow-100 text-yellow-500 border border-yellow-200";
    let badgeText = "UNDER PROGRESS";
    
    if (['Delivered', 'Completed'].includes(project.status)) {
      badgeClass = "bg-green-100 text-green-500 border border-green-200";
      badgeText = "DELIVERED";
    } else if (['Pending Quote', 'Under Review'].includes(project.status)) {
      badgeClass = "bg-gray-100 text-gray-500 border border-gray-200";
      badgeText = "PENDING";
    }

    const timelineSteps = [
      { label: "Quote Requested", sub: "Project request submitted", icon: <FiFileText size={18} /> },
      { label: "Receive Quotation", sub: "Quote shared by Admin", icon: <FiMail size={18} /> },
      { label: "Accept Or Reject Quote", sub: "Quote approved or rejected", icon: <FiCheck size={18} /> },
      { label: "Work In Progress", sub: "SCAN to CAD in progress", icon: <FiUser size={18} /> },
      { label: "Receive Files", sub: "CAD file delivered", icon: <FiDownload size={18} /> }
    ];

    const tabs = ['Project Details', 'Original Files (1)', 'Supporting Docs (0)', 'Completed Files (0)', 'Quotation & Invoice Docs (1)'];

    return (
      <div className="max-w-[1400px] mx-auto pb-12 font-sans bg-[#f9fafb] min-h-screen -mt-6 pt-6 px-4">
        
        {/* Header section */}
        <div className="mb-8 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-900 hover:text-blue-500 transition-colors">
                <FiArrowLeft size={24} strokeWidth={2.5} />
              </button>
              <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
                {project.title}
              </h1>
              <div className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2 ${badgeClass}`}>
                {badgeText}
              </div>
            </div>
            
            {project.quotationFiles && project.quotationFiles.length > 0 && (
              <button 
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                  window.open(`${baseUrl}/uploads/${project.quotationFiles[project.quotationFiles.length - 1].filename}`, '_blank');
                }}
                className="bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 text-xs font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <FiDownload /> Download Quote PDF
              </button>
            )}
          </div>
          <div className="text-sm font-medium text-gray-500 ml-10">
            Created: {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="mb-10 px-10">
          <div className="relative flex justify-between items-center w-full mt-4">
            {/* Connecting Line (Background) */}
            <div className="absolute top-6 left-[10%] right-[10%] h-[3px] bg-blue-100 z-0"></div>
            
            {/* Connecting Line (Foreground) */}
            <div className="absolute top-6 left-[10%] h-[3px] bg-blue-400 z-0 transition-all duration-500" style={{ width: `${(currentIdx / (timelineSteps.length - 1)) * 80}%` }}></div>

            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-3 transition-colors duration-300 ${
                    isCompleted ? 'bg-blue-400 text-white shadow-blue-400/30' : 'bg-white text-gray-300 border-2 border-gray-100'
                  }`}>
                    {step.icon}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 text-center mb-1">{step.label}</h4>
                  <p className="text-[11px] text-gray-400 text-center max-w-[120px] leading-tight font-medium">
                    {step.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-8 px-2">
          
          {/* Left Column (Tabs + Main Info) */}
          <div className="flex-1 flex flex-col gap-6 w-full overflow-hidden">
            
            {/* Tabs Row */}
            <div className="border-b border-gray-200 flex flex-wrap gap-x-8 gap-y-2">
              {[
                { id: 'details', label: 'Project Details' },
                { id: 'original', label: `Original Files (${project.scanFiles?.length || 0})` },
                { id: 'supporting', label: `Supporting Docs (${project.referenceImages?.length || 0})` },
                { id: 'completed', label: `Completed Files (${project.completedFiles?.length || 0})` },
                { id: 'invoice', label: `Quotation & Invoice Docs (${(project.quotationFiles?.length || 0) + (project.invoiceFiles?.length || 0)})` }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-t-md"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="flex flex-col gap-6">
                {/* Description Block */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                    <FiFileText size={16} className="text-gray-500" />
                    DESCRIPTION
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      {project.description || 'Description about the project Details'}
                    </p>
                  </div>
                </div>

                {/* Technical Details Block */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                    <BiScan size={18} className="text-gray-500" />
                    Technical Details
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-y-8">
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Project Name</h3>
                      <p className="text-sm font-bold text-gray-900 pr-4">{project.title}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Industry</h3>
                      <p className="text-sm font-bold text-gray-900">{project.industry || 'Automotive'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Application</h3>
                      <p className="text-sm font-bold text-gray-900">{project.appType || 'Remanufacturing'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Required Accuracy</h3>
                      <p className="text-sm font-bold text-gray-900 bg-gray-100 w-max px-2 py-0.5 rounded">{project.accuracy || '±0.05mm'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Material/Part Type</h3>
                      <p className="text-sm font-bold text-gray-900">Cast Aluminum A356</p>
                    </div>
                  </div>
                </div>

                {/* Hour Summary Block */}
                {project.estimatedHours > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                      <FiClock size={16} className="text-gray-500" />
                      HOUR SUMMARY
                    </div>
                    <div className="p-6 grid grid-cols-3 divide-x divide-gray-100">
                      <div className="flex flex-col items-center">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Required Hours</h3>
                        <p className="text-2xl font-bold text-gray-900">{project.estimatedHours}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">CAD Wallet Hours</h3>
                        <p className="text-2xl font-bold text-gray-900">{project.freeHoursApplied || 0}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">PO Hours</h3>
                        <p className="text-2xl font-bold text-gray-900">{project.billableHours || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'original' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                  <FiFileText size={16} className="text-gray-500" />
                  Original Files
                </div>
                {project.scanFiles && project.scanFiles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">#</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">File Name</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-center">Required Hours</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {project.scanFiles.map((file, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-800">
                              {idx + 1}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-800">
                              <div className="flex items-center gap-2">
                                <FiFileText className="text-blue-500 flex-shrink-0" />
                                <span className="truncate max-w-[200px] xl:max-w-[300px] block">{file.originalname}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-gray-900 text-center">
                              {project.estimatedHours || 5}
                            </td>
                            <td className="py-4 px-6 text-right space-y-2">
                              <button 
                                onClick={() => setActivePreviewUrl(`${baseUrl}/uploads/${file.filename}`)}
                                className="w-[100px] inline-flex items-center justify-center bg-white border border-blue-200 text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Preview
                              </button>
                              <br />
                              <a 
                                href={`${baseUrl}/uploads/${file.filename}`}
                                download
                                target="_blank" rel="noreferrer"
                                className="w-[100px] inline-flex items-center justify-center bg-[#3b82f6] text-white hover:bg-blue-600 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <FiFileText size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No original files</h3>
                    <p className="text-sm text-gray-500">No original scan files were found.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'supporting' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                  <FiFileText size={16} className="text-gray-500" />
                  Supporting Documents
                </div>
                {project.referenceImages && project.referenceImages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">File Name</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-center">Size</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {project.referenceImages.map((file, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-800 flex items-center gap-2">
                              <FiFileText className="text-blue-500 flex-shrink-0" /> <span className="truncate max-w-[300px]">{file.originalname}</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500 text-center">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </td>
                            <td className="py-4 px-6 text-right">
                              <a 
                                href={`${baseUrl}/uploads/${file.filename}`}
                                download
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-[#3b82f6] text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                              >
                                <FiDownload /> Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <FiFileText size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No supporting documents</h3>
                    <p className="text-sm text-gray-500">No supporting documents were found.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                  <FiFileText size={16} className="text-gray-500" />
                  Completed CAD Files
                </div>
                {project.completedFiles && project.completedFiles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">File Name</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-center">Size</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {project.completedFiles.map((file, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-800 flex items-center gap-2">
                              <FiFileText className="text-blue-500 flex-shrink-0" /> <span className="truncate max-w-[300px]">{file.originalname}</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500 text-center">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </td>
                            <td className="py-4 px-6 text-right">
                              <a 
                                href={`${baseUrl}/uploads/${file.filename}`}
                                download
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-[#3b82f6] text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                              >
                                <FiDownload /> Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <FiFileText size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No completed files yet</h3>
                    <p className="text-sm text-gray-500">Your completed CAD files will appear here once ready.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm">
                  <FiFileText size={16} className="text-gray-500" />
                  Quotation & Invoice Documents
                </div>
                {(project.quotationFiles?.length > 0 || project.invoiceFiles?.length > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">Document Type</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase">File Name</th>
                          <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {project.quotationFiles?.map((file, idx) => (
                          <tr key={`q-${idx}`} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-bold text-gray-600">Quotation</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-800 flex items-center gap-2">
                              <FiFileText className="text-blue-500 flex-shrink-0" /> <span className="truncate max-w-[300px]">{file.originalname}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <a 
                                href={`${baseUrl}/uploads/${file.filename}`}
                                download
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-[#3b82f6] text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                              >
                                <FiDownload /> Download
                              </a>
                            </td>
                          </tr>
                        ))}
                        {project.invoiceFiles?.map((file, idx) => (
                          <tr key={`i-${idx}`} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-bold text-gray-600">Invoice</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-800 flex items-center gap-2">
                              <FiFileText className="text-green-500 flex-shrink-0" /> <span className="truncate max-w-[300px]">{file.originalname}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <a 
                                href={`${baseUrl}/uploads/${file.filename}`}
                                download
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                              >
                                <FiDownload /> Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <FiFileText size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No documents available</h3>
                    <p className="text-sm text-gray-500">Quotations and invoices will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Empty States for other tabs */}
            {!['details', 'completed', 'invoice', 'original', 'supporting'].includes(activeTab) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <FiFileText size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No documents available</h3>
                <p className="text-sm text-gray-500">There are no files available in this section yet.</p>
              </div>
            )}

            {/* Report File Issues - Always at the bottom of the left column */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-auto">
              <div className="px-6 py-4 flex items-center gap-2 text-gray-700 font-medium text-sm">
                <FiAlertTriangle size={16} className="text-gray-600" />
                Report File Issues
              </div>
              <div className="px-6 pb-6 pt-0">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-3">
                  <FiSettings size={14} className="text-gray-400" /> Additional Notes
                </div>
                <div className="relative">
                  <textarea 
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="Any other concerns or questions? Let us know..."
                    className="w-full border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-blue-500 min-h-[140px] resize-none text-gray-700"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] text-gray-400 font-medium">
                    {issueText.length}/1000
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-md text-sm transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2">
                    <FiSend size={14} /> Submit Issues
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sidecards) */}
          <div className="xl:w-[350px] flex-shrink-0 flex flex-col gap-6">
            
            {/* 3D Preview */}
            <div className="bg-[#f8f9fa] rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[300px] flex flex-col items-center justify-center relative">
              {stlUrl ? (
                <div className="w-full h-full relative">
                   <StlViewer url={stlUrl} />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 mb-4 border border-gray-100">
                    <BiScan size={24} />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Select a file to preview 3D model</p>
                </>
              )}
            </div>

            {/* Quote Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                QUOTE SUMMARY
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Project ID</span>
                  <span className="text-sm font-bold text-gray-900">{shortId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <span className="text-sm font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-gray-600">Required Hours</span>
                  <span className="text-2xl font-bold text-gray-900">{project.estimatedHours || 5}</span>
                </div>
              </div>
            </div>

            {/* Pay Now block */}
            {project.billableHours > 0 && (
              <div className="bg-[#1e1e1e] rounded-xl shadow-lg p-6 flex flex-col items-center">
                <p className="text-xs text-gray-400 font-medium mb-4">Pay your invoice amount here.</p>
                <button className="w-full bg-[#3b82f6] hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg text-lg transition-colors shadow-sm">
                  Pay Now
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    );
  };

  // Determine layout conditionally
  if (['Pending Quote', 'Quote Ready', 'Revision Requested', 'Rejected'].includes(project.status)) {
    return renderQuotePhaseLayout();
  } else {
    return renderActiveProjectLayout();
  }
}
