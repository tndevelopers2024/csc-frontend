import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiDownload, BiUpload, BiLinkAlt } from 'react-icons/bi';
import StlViewer from '../components/StlViewer';

export default function AdminQuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for file estimation
  const [estimatedHours, setEstimatedHours] = useState({});
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // Completed files upload state
  const [selectedCompletedFiles, setSelectedCompletedFiles] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects/${id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          
          const initialHours = {};
          if (data.scanFiles) {
            data.scanFiles.forEach((_, idx) => initialHours[idx] = data.estimatedHours ? Math.floor(data.estimatedHours / data.scanFiles.length) : 0);
          }
          setEstimatedHours(initialHours);
        } else {
          navigate('/admin/dashboard');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, navigate]);

  const handleHourChange = (idx, delta) => {
    setEstimatedHours(prev => ({
      ...prev,
      [idx]: Math.max(0, (prev[idx] || 0) + delta)
    }));
  };

  const handlePreview = (filename) => {
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    setActivePreviewUrl(`${baseUrl}/uploads/${filename}`);
  };

  const handleDownload = (filename) => {
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    window.open(`${baseUrl}/uploads/${filename}`, '_blank');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setQuotationFile(e.target.files[0]);
    }
  };

  const totalHours = Object.values(estimatedHours).reduce((a, b) => a + b, 0);
  
  // Calculate free hours
  const userFreeHours = project?.userId?.freeHoursRemaining || 0;
  const wantsFreeHours = project?.useFreeHours && project.useFreeHours.startsWith('Yes');
  const freeHoursApplied = wantsFreeHours ? Math.min(totalHours, userFreeHours) : 0;
  const billableHours = totalHours - freeHoursApplied;

  const submitQuote = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('status', 'Quote Ready');
      formData.append('estimatedHours', totalHours);
      formData.append('freeHoursApplied', freeHoursApplied);
      formData.append('billableHours', billableHours);
      
      if (quotationFile) {
        formData.append('quotationFile', quotationFile);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: formData
      });
      
      if (res.ok) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Error submitting quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('status', newStatus);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: formData
      });
      
      if (res.ok) {
        const updatedProject = await res.json();
        // The API returns { message, project }
        setProject(updatedProject.project || updatedProject);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadCompletedFiles = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Append completed files
      Object.keys(selectedCompletedFiles).forEach(idx => {
        formData.append('completedFiles', selectedCompletedFiles[idx]);
      });

      // Append invoice file
      if (selectedInvoice) {
        formData.append('invoiceFiles', selectedInvoice);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects/${id}/upload-completed`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: formData
      });
      
      if (res.ok) {
        const updatedProject = await res.json();
        setProject(updatedProject);
        setSelectedCompletedFiles({});
        setSelectedInvoice(null);
        alert('Files uploaded successfully');
      }
    } catch (err) {
      console.error('Error uploading completed files:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  if (!project) return null;

  const createdDate = new Date(project.createdAt).toLocaleDateString('en-US');
  const customerName = project.userId ? `${project.userId.firstName} ${project.userId.lastName}` : 'Unknown';

  const renderFooter = () => {
    if (project.status === 'Pending Quote' || project.status === 'Revision Requested') {
      return (
        <div className="bg-[#f4f8ff] rounded-xl border border-blue-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">Raise Quote</h2>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-600">Total Estimated Hours: <span className="text-gray-800">{totalHours}</span></p>
              {wantsFreeHours && freeHoursApplied > 0 && (
                <p className="text-xs font-bold text-green-600">Free Hours Applied: -{freeHoursApplied}</p>
              )}
              <p className="text-sm font-bold text-gray-800 mt-1">Billable Hours: <span className="text-blue-600 text-lg">{billableHours}</span></p>
            </div>
            {totalHours === 0 && (
              <p className="text-xs text-red-500 mt-2 font-medium">Please estimate at least 1 hour before submitting.</p>
            )}
          </div>
          <button 
            onClick={submitQuote} 
            disabled={submitting || totalHours === 0}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit ${
              submitting || totalHours === 0
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-[#3b82f6] text-white hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Quote'}
          </button>
        </div>
      );
    }
    
    if (project.status === 'Quote Ready') {
      return (
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-orange-800 mb-1">Quote Submitted</h2>
            <p className="text-xs text-orange-600 font-medium">Waiting for customer approval or revision request.</p>
          </div>
        </div>
      );
    }
    
    if (project.status === 'Approved') {
      return (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-green-800 mb-1">Customer Approved!</h2>
            <p className="text-xs text-green-600 font-medium mb-4">The customer has approved the quote and authorized the project.</p>
            
            {project.poFile ? (
              <div className="bg-white rounded-lg p-3 border border-green-100 inline-flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center text-lg">📄</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Purchase Order Attached</p>
                  <button 
                    onClick={() => handleDownload(project.poFile.filename)}
                    className="text-xs font-bold text-blue-600 hover:underline text-left truncate max-w-[250px]"
                  >
                    {project.poFile.originalname}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-3 border border-green-100 inline-flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-lg">💳</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Payment Method</p>
                  <p className="text-xs font-bold text-gray-700">Instant Payment Authorized</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 min-w-[240px]">
            <button 
              onClick={() => updateStatus('In Progress')} 
              disabled={submitting}
              className={`w-full px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                submitting ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-emerald-600 shadow-sm'
              }`}
            >
              Verify & Start CAD
            </button>
            
            <button 
              onClick={() => updateStatus('Rejected')} 
              disabled={submitting}
              className={`w-full px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors border bg-white ${
                submitting ? 'border-red-200 text-red-300 cursor-not-allowed' : 'border-red-500 text-red-500 hover:bg-red-50'
              }`}
            >
              Reject Project / PO
            </button>
          </div>
        </div>
      );
    }

    if (project.status === 'Rejected') {
      return (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-red-800 mb-1">Project / PO Rejected</h2>
            <p className="text-xs text-red-600 font-medium">You have rejected the customer's authorization. Waiting for the customer to submit a new PO or payment.</p>
          </div>
        </div>
      );
    }
    
    if (project.status === 'In Progress') {
      return (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-blue-800 mb-1">CAD Production in Progress</h2>
            <p className="text-xs text-blue-600 font-medium">The engineering team is currently working on this project.</p>
          </div>
          <button 
            onClick={() => updateStatus('Delivered')} 
            disabled={submitting}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit ${
              submitting ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-[#3b82f6] text-white hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Updating...' : 'Deliver to Customer'}
          </button>
        </div>
      );
    }
    
    if (project.status === 'QA Review') {
      return (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-purple-800 mb-1">QA Review</h2>
            <p className="text-xs text-purple-600 font-medium">Project is undergoing quality assurance before final delivery.</p>
          </div>
          <button 
            onClick={() => updateStatus('Delivered')} 
            disabled={submitting}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit ${
              submitting ? 'bg-purple-300 text-white cursor-not-allowed' : 'bg-[#8b3dff] text-white hover:bg-purple-600'
            }`}
          >
            {submitting ? 'Updating...' : 'Deliver to Customer'}
          </button>
        </div>
      );
    }

    if (project.status === 'Delivered') {
      return (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-1">Project Delivered</h2>
            <p className="text-xs text-gray-600 font-medium">The final files have been delivered to the customer.</p>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-center">
        <p className="text-sm font-medium text-gray-600">Current Status: {project.status}</p>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#8b3dff] rounded-t-xl px-8 py-6 text-white mb-6 relative">
        <button onClick={() => navigate('/admin/dashboard')} className="absolute right-4 top-4 text-white/70 hover:text-white">✕</button>
        <h1 className="text-2xl font-bold mb-3">{project.title}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-[#fff8ea] text-[#d97706] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            {project.status === 'Pending Quote' ? 'Requested' : project.status}
          </span>
          <span className="text-white/80">Created: {createdDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-blue-500">⊙</span> Project Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400">Description :</p>
              <p className="text-sm font-medium text-gray-800">{project.description || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Technical Details :</p>
              <p className="text-sm font-medium text-gray-800">{project.appType} / {project.cadOutput}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Live Transfer Format :</p>
              <p className="text-sm font-medium text-gray-800">CAD Neutral Files: Yes<br/>2D Drafting: No</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Use Free Hours?</p>
              <p className="text-sm font-medium text-gray-800">{project.useFreeHours || 'No'}</p>
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-blue-500">👤</span> Customer Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400">Name :</p>
              <p className="text-sm font-medium text-gray-800">{customerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Email :</p>
              <p className="text-sm font-medium text-gray-800">{project.userId?.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Contact :</p>
              <p className="text-sm font-medium text-gray-800">{project.userId?.mobilePrefix} {project.userId?.mobile}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">Free Hours Remaining :</p>
              <p className="text-sm font-bold text-green-600">{userFreeHours} hrs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Original Files Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 inline-block">
            Original Files ({project.scanFiles?.length || 0})
          </h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase">#</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase">File Name</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Estimated Hours</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.scanFiles?.map((file, idx) => (
                  <tr key={idx}>
                    <td className="py-3">
                      <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-700 font-medium truncate max-w-[150px]">
                      {file.originalname}
                    </td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleHourChange(idx, -1)} 
                          disabled={project.status !== 'Pending Quote' && project.status !== 'Revision Requested'}
                          className="w-6 h-6 flex items-center justify-center border border-orange-200 text-orange-500 rounded hover:bg-orange-50 disabled:opacity-50"
                        >-</button>
                        <span className="w-6 text-xs font-bold text-gray-700 text-center">{estimatedHours[idx] || 0}</span>
                        <button 
                          onClick={() => handleHourChange(idx, 1)} 
                          disabled={project.status !== 'Pending Quote' && project.status !== 'Revision Requested'}
                          className="w-6 h-6 flex items-center justify-center border border-orange-200 text-orange-500 rounded hover:bg-orange-50 disabled:opacity-50"
                        >+</button>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handlePreview(file.filename)} className="text-[11px] font-semibold text-blue-500 hover:underline">
                          Preview
                        </button>
                        <button onClick={() => handleDownload(file.filename)} className="text-gray-400 hover:text-gray-700">
                          <BiDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
              accept=".pdf,.doc,.docx" 
            />
            {(project.status === 'Pending Quote' || project.status === 'Revision Requested') && (
              <button 
                onClick={() => fileInputRef.current.click()}
                className="border border-gray-300 text-gray-600 rounded px-4 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 self-start"
              >
                <BiUpload /> Upload Quotation
              </button>
            )}
            {quotationFile && (
              <span className="text-xs text-green-600 font-medium break-all">
                Selected: {quotationFile.name}
              </span>
            )}
            {project.quotationFiles && project.quotationFiles.length > 0 && (
              <span className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                <BiDownload /> Current: {project.quotationFiles[project.quotationFiles.length - 1].originalname}
              </span>
            )}
            
            {project.poFile && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Customer PO Document</span>
                <button 
                  onClick={() => handleDownload(project.poFile.filename)}
                  className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-1 self-start"
                >
                  <BiDownload /> {project.poFile.originalname}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3D Preview Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex items-center justify-center">
          {activePreviewUrl ? (
            <div className="w-full h-full relative">
              <StlViewer url={activePreviewUrl} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm font-medium">Select a file to preview 3D model</p>
            </div>
          )}
        </div>
      </div>

      {/* Complete Project Files Section */}
      {!['Pending Quote', 'Quote Ready', 'Revision Requested', 'Rejected'].includes(project.status) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-bold text-gray-800">Complete Project Files</h2>
            <span className="text-[11px] bg-gray-100 text-gray-500 font-medium px-2 py-1 rounded">Supports all file types (.stl, .step, .dwg, etc.)</span>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left bg-gray-50/50 rounded-lg">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase">Original File</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase text-center">Completed File</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.scanFiles?.map((file, idx) => {
                  const uploadedCompleted = project.completedFiles?.[idx];
                  const pendingUpload = selectedCompletedFiles[idx];
                  
                  return (
                    <tr key={idx} className="bg-white">
                      <td className="py-4 px-4 text-xs text-gray-700 font-medium truncate max-w-[200px] flex items-center gap-2">
                        <BiLinkAlt className="text-gray-400" /> {file.originalname}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {uploadedCompleted ? (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold">Completed</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded text-[10px] font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-xs">
                        {uploadedCompleted ? (
                          <span className="text-gray-600 font-medium truncate max-w-[150px] inline-block">{uploadedCompleted.originalname}</span>
                        ) : pendingUpload ? (
                          <span className="text-blue-500 font-medium truncate max-w-[150px] inline-block">{pendingUpload.name}</span>
                        ) : (
                          <span className="text-gray-400">Not uploaded yet</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!uploadedCompleted && (
                          <div className="inline-block relative">
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedCompletedFiles(prev => ({...prev, [idx]: e.target.files[0]}));
                                }
                              }}
                            />
                            <button className="text-[11px] font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded flex items-center gap-1 ml-auto">
                              <BiUpload /> Select File
                            </button>
                          </div>
                        )}
                        {uploadedCompleted && (
                          <button onClick={() => handleDownload(uploadedCompleted.filename)} className="text-[11px] font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded flex items-center gap-1 ml-auto">
                            <BiDownload /> Download
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end border-t border-gray-100 pt-6">
            <div className="flex flex-col gap-2">
              <div className="relative inline-block w-fit">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedInvoice(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.doc,.docx"
                />
                <button className="border border-gray-300 text-gray-600 rounded px-4 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2">
                  <BiUpload /> Upload Invoice
                </button>
              </div>
              {selectedInvoice && (
                <span className="text-[10px] text-green-600 font-bold">Selected: {selectedInvoice.name}</span>
              )}
              {project.invoiceFiles?.length > 0 && (
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                  <BiDownload /> Current Invoice: {project.invoiceFiles[project.invoiceFiles.length - 1].originalname}
                </span>
              )}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-6">
              <span className="text-xs font-medium text-gray-600">
                {Object.keys(selectedCompletedFiles).length + (selectedInvoice ? 1 : 0)} file(s) selected for upload
              </span>
              <button 
                onClick={uploadCompletedFiles}
                disabled={submitting || (Object.keys(selectedCompletedFiles).length === 0 && !selectedInvoice)}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2"
              >
                <BiUpload /> {submitting ? 'Uploading...' : 'Upload All Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {renderFooter()}

    </div>
  );
}
