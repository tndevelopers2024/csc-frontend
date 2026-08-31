import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiAlertCircle } from 'react-icons/fi';
import ApprovalModal from '../components/ApprovalModal';
import RevisionModal from '../components/RevisionModal';

export default function Quotations() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
  const [isRevisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [selectedProjectData, setSelectedProjectData] = useState(null);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Filter projects that are relevant to quotations
        const relevantStatuses = [
          'Pending Quote', 'Quote Ready', 'Approved', 'Under Review', 
          'Revision Requested', 'Rejected', 'In Progress', 'QA Review', 'Delivered', 'Completed'
        ];
        const filtered = data.filter(p => relevantStatuses.includes(p.status));
        
        const mappedQuotes = filtered.map(p => ({
          id: p._id.substring(p._id.length - 8).toUpperCase(), // Short ID
          rawId: p._id,
          projectTitle: p.title,
          projectMeta: `${p.cadOutput || 'CAD'} • ${p.appType || 'Scan'}`,
          date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: p.status,
          hours: p.estimatedHours ? `${p.estimatedHours} hrs` : (p.status === 'Pending Quote' ? '—' : 'TBD'),
          price: p.billableHours !== undefined && p.billableHours > 0 ? `$${p.billableHours * 50}` : (p.billableHours === 0 && p.estimatedHours > 0 ? '$0' : (p.status === 'Pending Quote' ? '—' : 'TBD')),
          discount: p.freeHoursApplied ? `${p.freeHoursApplied} Free Hours Applied` : (p.status === 'Pending Quote' ? '—' : 'None'),
          discountActive: p.freeHoursApplied > 0 ? true : (p.status === 'Pending Quote' ? null : false),
          rawProject: p
        }));
        
        setQuotes(mappedQuotes);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleActionClick = (id, type, projectData) => {
    setSelectedQuoteId(id);
    setSelectedProjectData(projectData);
    if (type === 'Approved') {
      setApprovalModalOpen(true);
    } else if (type === 'Revision Requested') {
      setRevisionModalOpen(true);
    }
  };

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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${selectedQuoteId}/status`, options);
      
      if (res.ok) {
        fetchQuotes();
      } else {
        const errorData = await res.json();
        console.error('Error:', errorData.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApprovePO = async (poFile) => {
    setApprovalModalOpen(false);
    await updateProjectStatus('Approved', poFile);
  };

  const handleApprovePayment = async () => {
    setApprovalModalOpen(false);
    await updateProjectStatus('Approved');
  };

  const handleRevisionSubmit = async (data) => {
    setRevisionModalOpen(false);
    await updateProjectStatus('Revision Requested');
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'Quote Ready':
        return <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md text-xs font-bold shadow-sm border border-orange-100">Quote ready</span>;
      case 'Approved':
      case 'In Progress':
      case 'QA Review':
      case 'Delivered':
      case 'Completed':
        return <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-bold shadow-sm border border-green-100">{status === 'Approved' ? 'Approved' : 'Accepted'}</span>;
      case 'Under Review':
      case 'Revision Requested':
        return <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold shadow-sm border border-blue-100">{status}</span>;
      case 'Pending Quote':
        return <span className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-md text-xs font-bold shadow-sm border border-yellow-100">Pending</span>;
      case 'Rejected':
        return <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold shadow-sm border border-red-100">Rejected</span>;
      default:
        return <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-bold shadow-sm border border-gray-200">{status}</span>;
    }
  };

  const renderActions = (status, rawId, rawProject) => {
    if (status === 'Quote Ready') {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button onClick={() => handleActionClick(rawId, 'Approved', rawProject)} className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 text-xs rounded transition-colors">Approve</button>
          <button onClick={() => handleActionClick(rawId, 'Revision Requested', rawProject)} className="bg-[#f97316] hover:bg-orange-600 text-white font-semibold py-1.5 px-3 text-xs rounded transition-colors">Revision requested</button>
          <button onClick={() => navigate(`/dashboard/projects/${rawId}`)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button onClick={() => navigate(`/dashboard/projects/${rawId}`)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button onClick={() => navigate(`/dashboard/projects/${rawId}`)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    }
  };

  return (
    <div className="max-w-8xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b] mb-1">My Quotations</h1>
        <p className="text-gray-500 text-sm">Approve or review your quotes</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-24 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
        </div>
      ) : quotes.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FiFileText className="text-3xl text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No quotations found</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">
            You haven't requested any scan-to-CAD quotations yet. Start a new project to receive your first estimate.
          </p>
          <button onClick={() => navigate('/dashboard/new-project')} className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm transition-colors">
            New Project
          </button>
        </div>
      ) : (
        /* Populated State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-800 bg-white">
                  <th className="py-5 px-6 whitespace-nowrap">Quote ID</th>
                  <th className="py-5 px-6 whitespace-nowrap">Project</th>
                  <th className="py-5 px-6 whitespace-nowrap">Date</th>
                  <th className="py-5 px-6 whitespace-nowrap">Status</th>
                  <th className="py-5 px-6 whitespace-nowrap text-center">EST. Hours</th>
                  <th className="py-5 px-6 whitespace-nowrap text-center">Price</th>
                  <th className="py-5 px-6 whitespace-nowrap text-center">Discount & Promo code</th>
                  <th className="py-5 px-6 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors align-top bg-white">
                    <td className="py-6 px-6 text-sm text-gray-600">Q-{quote.id}</td>
                    <td className="py-6 px-6">
                      <div className="text-sm font-bold text-gray-900 mb-1 max-w-[150px] leading-tight">{quote.projectTitle}</div>
                      <div className="text-xs text-gray-400 max-w-[150px] leading-relaxed">{quote.projectMeta}</div>
                    </td>
                    <td className="py-6 px-6 text-sm text-gray-600">{quote.date}</td>
                    <td className="py-6 px-6">
                      {renderStatus(quote.status)}
                    </td>
                    <td className="py-6 px-6 text-sm text-gray-600 text-center">{quote.hours}</td>
                    <td className="py-6 px-6 text-sm font-bold text-gray-900 text-center">{quote.price}</td>
                    <td className="py-6 px-6 text-xs text-center">
                      {quote.discountActive === true && <span className="text-green-500 font-semibold">{quote.discount}</span>}
                      {quote.discountActive === false && <span className="text-gray-400 italic">{quote.discount}</span>}
                      {quote.discountActive === null && <span className="text-gray-400">{quote.discount}</span>}
                    </td>
                    <td className="py-6 px-6 flex justify-center">
                      {renderActions(quote.status, quote.rawId, quote.rawProject)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProjectData && (
        <ApprovalModal 
          isOpen={isApprovalModalOpen} 
          onClose={() => setApprovalModalOpen(false)} 
          project={selectedProjectData} 
          onApprovePO={handleApprovePO} 
          onApprovePayment={handleApprovePayment} 
        />
      )}
      
      <RevisionModal 
        isOpen={isRevisionModalOpen} 
        onClose={() => setRevisionModalOpen(false)} 
        onSubmitRevision={handleRevisionSubmit} 
      />

    </div>
  );
}
