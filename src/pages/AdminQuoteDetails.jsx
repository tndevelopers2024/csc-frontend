import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiDownload, BiUpload, BiLinkAlt } from 'react-icons/bi';
import { FiFileText, FiCreditCard, FiX, FiUser, FiLink, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiClock, FiExternalLink } from 'react-icons/fi';
import StlViewer from '../components/StlViewer';
import { useSocket } from '../context/SocketContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AdminQuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for file estimation
  const [estimatedHours, setEstimatedHours] = useState({});
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Completed files upload state
  const [selectedCompletedFiles, setSelectedCompletedFiles] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Deadline state for PO verification
  const [paymentDeadline, setPaymentDeadline] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

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
          let hourIdx = 0;
          if (data.links) {
            data.links.forEach((_, i) => { initialHours[`link-${i}`] = data.fileEstimatedHours?.[hourIdx++] || 0; });
          }
          if (data.scanFiles) {
            data.scanFiles.forEach((_, i) => { initialHours[i] = data.fileEstimatedHours?.[hourIdx++] || 0; });
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
    
    if (socket) {
      const handleProjectUpdate = (updatedProject) => {
        if (updatedProject._id === id) {
          fetchProject();
        }
      };
      
      socket.on('projectUpdated', handleProjectUpdate);
      
      return () => {
        socket.off('projectUpdated', handleProjectUpdate);
      };
    }
  }, [id, navigate, socket]);

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
      const totalItemsCount = (project.scanFiles?.length || 0) + (project.links?.length || 0);
      const hoursArray = [
        ...(project.links || []).map((_, i) => estimatedHours[`link-${i}`] || 0),
        ...(project.scanFiles || []).map((_, i) => estimatedHours[i] || 0)
      ];
      formData.append('fileEstimatedHours', JSON.stringify(hoursArray));
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
      if (newStatus === 'In Progress' && !paymentDeadline && project.status === 'Approved') {
        setToast({ type: 'error', message: 'Please select a payment deadline date before verifying.' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      if (newStatus === 'Delivered') {
        const hasScanFiles = project.scanFiles && project.scanFiles.length > 0;
        const allFilesCompleted = hasScanFiles 
          ? project.scanFiles.every((_, idx) => Boolean(project.completedFiles?.[idx]))
          : Boolean(project.completedFiles && project.completedFiles.length > 0);
        
        if (!allFilesCompleted) {
          const hasPendingUploads = Object.keys(selectedCompletedFiles).length > 0;
          setToast({ 
            type: 'error', 
            message: hasPendingUploads 
              ? "You have selected file(s) that are not uploaded yet. Please click 'Upload All Selected' first."
              : 'Please upload all completed CAD files before delivering.' 
          });
          setTimeout(() => setToast(null), 3000);
          return;
        }
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('status', newStatus);
      if (newStatus === 'In Progress' && paymentDeadline) {
        formData.append('paymentDeadline', paymentDeadline.toISOString());
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
        const updatedProject = await res.json();
        // The API returns { message, project }
        setProject(updatedProject.project || updatedProject);
        setToast({ type: 'success', message: `Status updated to ${newStatus}` });
        setTimeout(() => setToast(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setToast({ type: 'error', message: errData.message || 'Failed to update status' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setToast({ type: 'error', message: 'An error occurred while updating status.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadCompletedFiles = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Append completed files with their indices
      Object.keys(selectedCompletedFiles).forEach(idx => {
        formData.append('completedFiles', selectedCompletedFiles[idx]);
        formData.append('fileIndices', idx);
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
        setToast({ type: 'success', message: 'Files uploaded successfully!' });
        setTimeout(() => setToast(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setToast({ type: 'error', message: errData.message || 'Failed to upload files' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error uploading completed files:', err);
      setToast({ type: 'error', message: 'An error occurred while uploading files' });
      setTimeout(() => setToast(null), 3000);
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

  const createdDate = new Date(project.createdAt).toLocaleDateString('en-GB');
  const customerName = project.userId ? `${project.userId.firstName} ${project.userId.lastName}` : 'Unknown';

  const renderFooter = () => {
    if (project.status === 'Pending Quote' || project.status === 'Revision Requested') {
      const totalItemsCount = (project.scanFiles?.length || 0) + (project.links?.length || 0);
      const allItemsHaveHours = totalItemsCount === 0 || [
        ...(project.links || []).map((_, i) => `link-${i}`),
        ...(project.scanFiles || []).map((_, i) => i)
      ].every(key => estimatedHours[key] && estimatedHours[key] >= 1);
      const hasQuotation = Boolean(quotationFile);

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
            {!allItemsHaveHours && (
              <p className="text-xs text-red-500 mt-2 font-medium">Please estimate at least 1 hour for each file/link before submitting.</p>
            )}
            {allItemsHaveHours && totalHours > 0 && !hasQuotation && (
              <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1">
                <FiAlertCircle /> Please upload a quotation document before submitting.
              </p>
            )}
          </div>
          <button 
            onClick={submitQuote} 
            disabled={submitting || !allItemsHaveHours || totalHours === 0 || !hasQuotation}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit ${
              submitting || !allItemsHaveHours || totalHours === 0 || !hasQuotation
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
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center text-lg"><FiFileText /></div>
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
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-lg"><FiCreditCard /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Payment Method</p>
                  <p className="text-xs font-bold text-gray-700">Instant Payment Authorized</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 min-w-[240px]">
            <div className="flex flex-col gap-1 mb-2 relative z-50">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Customer Payment Deadline <span className="text-red-500">*</span></label>
              <div className="w-full">
                <DatePicker 
                  selected={paymentDeadline}
                  onChange={(date) => setPaymentDeadline(date)}
                  minDate={new Date()}
                  placeholderText="dd/mm/yyyy"
                  dateFormat="dd/MM/yyyy"
                  className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
            
            <button 
              onClick={() => updateStatus('In Progress')} 
              disabled={submitting}
              className={`w-full px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                submitting ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-emerald-600 shadow-sm'
              }`}
            >
              Verify & Start CAD
            </button>
            
            {!showRejectConfirm ? (
              <button 
                onClick={() => setShowRejectConfirm(true)} 
                disabled={submitting}
                className={`w-full px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors border bg-white ${
                  submitting ? 'border-red-200 text-red-300 cursor-not-allowed' : 'border-red-500 text-red-500 hover:bg-red-50'
                }`}
              >
                Reject Project / PO
              </button>
            ) : (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2 animate-in fade-in duration-200">
                <p className="text-xs font-bold text-red-700">Confirm Rejecting Project / PO?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowRejectConfirm(false);
                      updateStatus('Rejected');
                    }}
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-md shadow-xs flex items-center justify-center transition-colors"
                  >
                    Confirm Reject
                  </button>
                  <button 
                    onClick={() => setShowRejectConfirm(false)}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold py-2 rounded-md shadow-xs flex items-center justify-center transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
      const hasScanFiles = project.scanFiles && project.scanFiles.length > 0;
      const allFilesCompleted = hasScanFiles 
        ? project.scanFiles.every((_, idx) => Boolean(project.completedFiles?.[idx]))
        : Boolean(project.completedFiles && project.completedFiles.length > 0);
      const hasPendingUploads = Object.keys(selectedCompletedFiles).length > 0;
      const deliverDisabled = submitting || !allFilesCompleted;

      return (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-blue-800 mb-1">CAD Production in Progress</h2>
            <p className="text-xs text-blue-600 font-medium">The engineering team is currently working on this project.</p>
            {!allFilesCompleted && (
              <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                <FiAlertCircle /> {hasPendingUploads ? "You have selected file(s) that are not uploaded yet. Please click 'Upload All Selected' first." : "Please upload all completed CAD files before delivering."}
              </p>
            )}
          </div>
          <button 
            onClick={() => updateStatus('Delivered')} 
            disabled={deliverDisabled}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit shrink-0 ${
              deliverDisabled ? 'bg-blue-300 text-white cursor-not-allowed opacity-70' : 'bg-[#3b82f6] text-white hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Updating...' : 'Deliver to Customer'}
          </button>
        </div>
      );
    }
    
    if (project.status === 'QA Review') {
      const hasScanFiles = project.scanFiles && project.scanFiles.length > 0;
      const allFilesCompleted = hasScanFiles 
        ? project.scanFiles.every((_, idx) => Boolean(project.completedFiles?.[idx]))
        : Boolean(project.completedFiles && project.completedFiles.length > 0);
      const hasPendingUploads = Object.keys(selectedCompletedFiles).length > 0;
      const deliverDisabled = submitting || !allFilesCompleted;

      return (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-blue-800 mb-1">QA Review</h2>
            <p className="text-xs text-blue-600 font-medium">Project is undergoing quality assurance before final delivery.</p>
            {!allFilesCompleted && (
              <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                <FiAlertCircle /> {hasPendingUploads ? "You have selected file(s) that are not uploaded yet. Please click 'Upload All Selected' first." : "Please upload all completed CAD files before delivering."}
              </p>
            )}
          </div>
          <button 
            onClick={() => updateStatus('Delivered')} 
            disabled={deliverDisabled}
            className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors h-fit shrink-0 ${
              deliverDisabled ? 'bg-blue-300 text-white cursor-not-allowed opacity-70' : 'bg-blue-600 text-white hover:bg-blue-700'
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
          <button 
            onClick={() => updateStatus('In Progress')} 
            disabled={submitting}
            className="border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            Move back to In Progress
          </button>
        </div>
      );
    }

    if (project.status === 'Reported') {
      const hasScanFiles = project.scanFiles && project.scanFiles.length > 0;
      const allFilesCompleted = hasScanFiles 
        ? project.scanFiles.every((_, idx) => Boolean(project.completedFiles?.[idx]))
        : Boolean(project.completedFiles && project.completedFiles.length > 0);
      const deliverDisabled = submitting || !allFilesCompleted;

      return (
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-orange-950">Customer Reported an Issue</h2>
            </div>
            <p className="text-xs text-orange-800 font-medium">Customer has flagged an issue with the delivered files. Review the notes above, resume CAD production to make fixes, or upload updated files.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => updateStatus('In Progress')} 
              disabled={submitting}
              className="bg-white border border-orange-300 text-orange-800 hover:bg-orange-100/60 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-2xs"
            >
              Resume CAD (In Progress)
            </button>
            <button 
              onClick={() => updateStatus('Delivered')} 
              disabled={deliverDisabled}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                deliverDisabled ? 'bg-orange-300 text-white cursor-not-allowed opacity-70' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
              }`}
            >
              {submitting ? 'Updating...' : 'Re-Deliver to Customer'}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-center">
        <p className="text-sm font-medium text-gray-600">Current Status: {project.status}</p>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 right-8 z-50 animate-[fade-in-up_0.3s_ease-out]">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-xl text-blue-400" /> : <FiAlertCircle className="text-xl text-red-600" />}
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-blue-600 rounded-t-xl px-8 py-6 text-white mb-6 relative">
        <button onClick={() => navigate('/admin/dashboard')} className="absolute right-4 top-4 text-white/70 hover:text-white"><FiX /></button>
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
            {project.paymentDeadline && (
              <div>
                <p className="text-[11px] font-bold text-gray-400">Payment Deadline :</p>
                <p className="text-sm font-bold text-green-600">{new Date(project.paymentDeadline).toLocaleDateString('en-GB')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-blue-500"><FiUser /></span> Customer Information
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
            Original Files ({(project.scanFiles?.length || 0) + (project.links?.length || 0)})
          </h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase">#</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase">File/Link Name</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Estimated Hours</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.links?.map((link, idx) => (
                  <tr key={`link-${idx}`}>
                    <td className="py-3">
                      <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-700 font-medium truncate max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <FiLink className="text-gray-400 text-lg flex-shrink-0" />
                        <span className="truncate">{link}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleHourChange(`link-${idx}`, -1)} 
                          disabled={project.status !== 'Pending Quote' && project.status !== 'Revision Requested'}
                          className="w-6 h-6 flex items-center justify-center border border-orange-200 text-orange-500 rounded hover:bg-orange-50 disabled:opacity-50"
                        >-</button>
                        <span className="w-6 text-xs font-bold text-gray-700 text-center">{estimatedHours[`link-${idx}`] || 0}</span>
                        <button 
                          onClick={() => handleHourChange(`link-${idx}`, 1)} 
                          disabled={project.status !== 'Pending Quote' && project.status !== 'Revision Requested'}
                          className="w-6 h-6 flex items-center justify-center border border-orange-200 text-orange-500 rounded hover:bg-orange-50 disabled:opacity-50"
                        >+</button>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a 
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank" rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-500 hover:underline"
                        >
                          Open Link
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {project.scanFiles?.map((file, idx) => (
                  <tr key={`file-${idx}`}>
                    <td className="py-3">
                      <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {(project.links?.length || 0) + idx + 1}
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
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 break-all bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md self-start">
                <FiCheckCircle className="text-emerald-500" /> Selected: {quotationFile.name}
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
              <div className="text-4xl mb-2 flex items-center justify-center"><FiFileText /></div>
              <p className="text-sm font-medium">Select a file to preview 3D model</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reported Issues Section */}
      {((project.reportedIssues && project.reportedIssues.length > 0) || project.status === 'Reported') && (
        <div className="bg-orange-50/60 border border-orange-200/90 rounded-xl p-6 mb-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
                <FiAlertTriangle size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                  Customer Reported Issues
                  {project.status === 'Reported' && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  )}
                </h2>
                <p className="text-xs text-orange-700">The customer has submitted feedback/issues regarding the files for this project.</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200/70 uppercase tracking-wider">
              {project.status === 'Reported' ? 'Action Required' : 'Feedback Logged'}
            </span>
          </div>

          <div className="space-y-3">
            {project.reportedIssues && project.reportedIssues.length > 0 ? (
              project.reportedIssues.map((issue, idx) => (
                <div key={idx} className="bg-white border border-orange-200/80 rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">
                        {issue.ticketId ? `Ticket ${issue.ticketId}` : `Report #${idx + 1}`}
                      </span>
                      {issue.ticketId && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          Support Ticket Available
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <FiClock size={12} className="text-gray-400" />
                      {new Date(issue.reportedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-orange-50/40 rounded-lg border border-orange-100/80 text-xs text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                    <span className="font-semibold text-orange-950 block mb-1">Issue Details:</span>
                    {issue.notes}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between pt-1 text-[11px] text-gray-500">
                    <span>
                      Customer: <span className="font-semibold text-gray-700">{customerName}</span> ({project.userId?.email || 'Customer'})
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      Status: {issue.status || 'Open'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-orange-200 rounded-lg p-4 text-xs text-orange-850">
                This project has been placed in "Reported" status by the customer.
              </div>
            )}
          </div>
        </div>
      )}

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
