import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp, 
  FiArrowLeft, 
  FiPlus, 
  FiChevronRight, 
  FiTrendingUp, 
  FiFilter,
  FiCheckSquare,
  FiMessageSquare,
  FiInbox,
  FiCalendar,
  FiPhoneCall,
  FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineTicket } from 'react-icons/hi';
import { BiHeadphone } from 'react-icons/bi';
import TicketDetailsModal from '../components/TicketDetailsModal';

const FaqItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`border rounded-lg mb-4 overflow-hidden transition-colors shadow-xs ${isOpen ? 'bg-white border-blue-400' : 'bg-[#f0f6ff] border-blue-200 hover:border-blue-300'}`}>
    <button 
      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      onClick={onClick}
    >
      <span className="font-bold text-sm text-gray-900 pr-4">{question}</span>
      {isOpen ? <FiChevronUp className="text-gray-500 text-lg shrink-0" /> : <FiChevronDown className="text-gray-500 text-lg shrink-0" />}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-sm text-gray-700 leading-relaxed space-y-4">
        {answer}
      </div>
    )}
  </div>
);

export default function Support() {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'tickets' ? 'tickets' : (searchParams.get('view') === 'submit' ? 'submit-ticket' : 'faq');
  const [view, setView] = useState(initialView);
  const [previousView, setPreviousView] = useState('tickets');

  // FAQ state
  const [openFaqs, setOpenFaqs] = useState({ 0: true });

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ totalTickets: 0, openTickets: 0, awaitingReplyTickets: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'resolved'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    category: 'Technical',
    priority: 'Medium',
    subject: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Detail Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/my-tickets`, {
        params: {
          status: activeTab,
          sort: sortBy
        },
        headers: { 'x-auth-token': token }
      });

      setTickets(res.data.tickets || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sortBy]);

  const paramView = searchParams.get('view');

  // Synchronize view state with URL parameters (e.g. clicking Help Center resets to faq)
  useEffect(() => {
    if (paramView === 'tickets') {
      setView('tickets');
    } else if (paramView === 'submit') {
      setView('submit-ticket');
    } else {
      setView('faq');
    }
  }, [paramView]);

  useEffect(() => {
    if (view === 'tickets') {
      fetchTickets();
    }
  }, [view, fetchTickets]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      setSubmitError('Please provide both a Subject and a Description.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/tickets`,
        {
          category: ticketForm.category,
          priority: ticketForm.priority,
          subject: ticketForm.subject.trim(),
          description: ticketForm.description.trim()
        },
        { headers: { 'x-auth-token': token } }
      );

      setSubmitSuccess(true);
      // Reset form
      setTicketForm({
        category: 'Technical',
        priority: 'Medium',
        subject: '',
        description: ''
      });

      // Update state and transition to tickets view
      setTickets(prev => [res.data, ...prev]);
      setStats(prev => ({
        ...prev,
        totalTickets: prev.totalTickets + 1,
        openTickets: prev.openTickets + 1
      }));

      setTimeout(() => {
        setSubmitSuccess(false);
        setView('tickets');
        setSelectedTicket(res.data);
        setIsDetailsOpen(true);
      }, 700);

    } catch (err) {
      console.error('Error creating ticket:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketUpdated = (updatedTicket) => {
    setTickets(prev => prev.map(t => (t._id === updatedTicket._id ? updatedTicket : t)));
    setSelectedTicket(updatedTicket);
    fetchTickets();
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailsOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ticket.ticketId?.toLowerCase().includes(q) ||
      ticket.subject?.toLowerCase().includes(q) ||
      ticket.category?.toLowerCase().includes(q) ||
      ticket.subtext?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return (
          <span className="inline-block bg-[#fef3c7] text-[#92400e] text-[11px] font-bold px-2.5 py-1 rounded tracking-wide uppercase">
            IN PROGRESS
          </span>
        );
      case 'AWAITING CLIENT':
        return (
          <span className="inline-block bg-[#ffe4e6] text-[#be123c] text-[11px] font-bold px-2.5 py-1 rounded tracking-wide uppercase">
            AWAITING CLIENT
          </span>
        );
      case 'RESOLVED':
      case 'CLOSED':
        return (
          <span className="inline-block bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-2.5 py-1 rounded tracking-wide uppercase">
            RESOLVED
          </span>
        );
      default:
        return (
          <span className="inline-block bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold px-2.5 py-1 rounded tracking-wide uppercase">
            OPEN
          </span>
        );
    }
  };

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatCreatedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const faqs = [
    {
      question: "How do I upload a 3D scan file?",
      answer: (
        <>
          <p>In the Upload Scan Files section, Drag and drop your files, click Browse Files to select them from your device, or add a link from your cloud or drive storage.</p>
          <p>You can upload up to 5 files, with a maximum file size of 5 GB per file.</p>
          <p>We support common 3D scan formats including STL, OBJ, PLY, STEP, IGES, PTS, PTX, and XYZ.</p>
        </>
      )
    },
    {
      question: "What file formats are supported?",
      answer: (
        <p>We support a wide variety of formats including STL, OBJ, PLY, and more. For CAD outputs, we typically deliver STEP, IGES, or native SolidWorks files depending on your request.</p>
      )
    },
    {
      question: "How does the free CAD hours work?",
      answer: (
        <>
          <p>New users receive 3 complimentary CAD hours as part of their welcome offer. You can apply these hours to an eligible project and pay only for the remaining billable hours.</p>
          <p>For example, if your project requires 4 CAD hours, you can use your 3 complimentary hours and pay for just 1 hour.</p>
          <p>You're not required to use the free hours on your first project. You can save them and apply them to a future eligible project while they remain valid.</p>
        </>
      )
    },
    {
      question: "How long does a quotation take?",
      answer: (
        <>
          <p>Once you submit your scan files and project requirements, our engineering team reviews the data and prepares a detailed quotation. Most quotations are provided within 3 business hours, depending on the project size and complexity.</p>
          <p>For larger or more complex projects, we may need additional information before providing an accurate estimate.</p>
        </>
      )
    },
    {
      question: "How do I download my finished CAD files?",
      answer: (
        <>
          <p>Once your project is completed, your finished CAD files will be available in your My Project. Open the completed project, review the available deliverables, and click Download to save the files to your device.</p>
          <p>You can access your completed project and files anytime from your dashboard.</p>
        </>
      )
    }
  ];

  /* -------------------------------------------------------------
   * RENDER: CONTACT SUPPORT / SUBMIT A TICKET VIEW
   * ----------------------------------------------------------- */
  if (view === 'submit-ticket') {
    return (
      <div className="max-w-8xl mx-auto pb-16">
        
        {/* Header Bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setView(previousView || 'tickets')}
            className="p-1.5 -ml-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Back"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Contact Support</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Submit a Ticket Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-8">
              
              {/* Card Header */}
              <div className="flex items-center gap-2.5 mb-6">
                <HiOutlineTicket className="text-2xl text-gray-700 shrink-0" />
                <h2 className="text-xl font-bold text-gray-900">Submit a Ticket</h2>
              </div>
              <div className="border-t border-gray-100 mb-6"></div>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in duration-200">
                  <FiCheckCircle className="text-lg text-emerald-600 shrink-0" />
                  <span>Ticket submitted successfully! Opening your tickets...</span>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm animate-in fade-in duration-200">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-6">
                
                {/* Category & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full appearance-none bg-[#f1f5f9] border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white px-4 py-3 rounded-md text-sm text-gray-800 focus:outline-none transition-all cursor-pointer pr-10 font-medium"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Data Processing">Data Processing</option>
                        <option value="Calibration">Calibration</option>
                        <option value="Billing">Billing</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                      <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Priority</label>
                    <div className="relative">
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full appearance-none bg-[#f1f5f9] border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white px-4 py-3 rounded-md text-sm text-gray-800 focus:outline-none transition-all cursor-pointer pr-10 font-medium"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                      <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base" />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your request"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-[#f1f5f9] border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white px-4 py-3 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide as much technical detail as possible, including equipment models and scan file formats used..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#f1f5f9] border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white px-4 py-3 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-md shadow-xs transition-colors text-sm cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Ticket</span>
                        <span className="text-sm font-bold leading-none">▷</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>

          {/* Right Column - Side Widgets */}
          <div className="space-y-6">
            
            {/* Widget 1: Schedule a Call */}
            <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4">
                <FiCalendar />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule a Call</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Book a 15-min consultation with a CAD specialist.
              </p>
              <button
                type="button"
                onClick={() => alert('Booking link consultation portal')}
                className="w-full py-2.5 px-4 border border-blue-400 hover:border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold rounded-md text-sm transition-colors text-center cursor-pointer block"
              >
                Booking Link
              </button>
            </div>

            {/* Widget 2: Technical Emergency */}
            <div className="bg-[#2563eb] rounded-xl p-6 text-white shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white text-lg shrink-0">
                  <BiHeadphone />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Technical Emergency</h3>
              </div>
              <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                Dedicated 24/7 priority line for enterprise clients on active deployments.
              </p>
              <a
                href="tel:+18002237226"
                className="w-full bg-[#3b82f6] hover:bg-blue-400 text-white font-bold py-3 px-4 rounded-md text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FiPhoneCall className="text-base" />
                <span>+1 (800) CAD- SCAN</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* -------------------------------------------------------------
   * RENDER: SUPPORT TICKETS VIEW
   * ----------------------------------------------------------- */
  if (view === 'tickets') {
    return (
      <div className="max-w-8xl mx-auto pb-16">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('faq')}
                className="p-1.5 -ml-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Back to Help Center"
              >
                <FiArrowLeft className="text-2xl" />
              </button>
              <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Support Tickets</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-9">Track and manage your support requests.</p>
          </div>

          <button
            onClick={() => {
              setPreviousView('tickets');
              setView('submit-ticket');
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all text-sm cursor-pointer"
          >
            <FiPlus className="text-lg" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          
          {/* Total Tickets */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Tickets</span>
                <div className="text-4xl font-extrabold text-[#0f172a] mt-2 tracking-tight">
                  {stats.totalTickets > 0 ? String(stats.totalTickets).padStart(2, '0') : '00'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                <HiOutlineTicket />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <FiTrendingUp className="text-sm" />
              <span>+12% from last month</span>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Open Tickets</span>
                <div className="text-4xl font-extrabold text-[#0284c7] mt-2 tracking-tight">
                  {stats.openTickets > 0 ? String(stats.openTickets).padStart(2, '0') : '00'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xl shrink-0">
                <FiCheckSquare />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-gray-500">
              Active investigations
            </div>
          </div>

          {/* Awaiting Reply */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Awaiting Reply</span>
                <div className="text-4xl font-extrabold text-[#ea580c] mt-2 tracking-tight">
                  {stats.awaitingReplyTickets > 0 ? String(stats.awaitingReplyTickets).padStart(2, '0') : '00'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-xl shrink-0">
                <FiMessageSquare />
              </div>
            </div>
            <div className="mt-4 text-xs font-bold text-[#ea580c]">
              Require your attention
            </div>
          </div>

        </div>

        {/* Filters and Sorting Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          
          {/* Segmented Filter Pills */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg border border-gray-200/60">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'resolved'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Right side: Search & Sort */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-60">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 shadow-2xs">
                <FiFilter className="text-gray-500" />
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6">Last Activity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                      <p className="text-xs">Loading support tickets...</p>
                    </td>
                  </tr>
                ) : filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => openTicketDetail(ticket)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="py-4 px-6 text-xs font-bold text-gray-900 tracking-wide whitespace-nowrap">
                        {ticket.ticketId}
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6 max-w-xs sm:max-w-md">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {ticket.subject}
                        </div>
                        {ticket.subtext && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {ticket.subtext}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block bg-[#f1f5f9] text-[#475569] text-xs font-semibold px-2.5 py-1 rounded">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-4 px-6 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {formatCreatedDate(ticket.createdAt)}
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-6 text-xs font-medium text-gray-600 whitespace-nowrap">
                        {formatActivityDate(ticket.lastActivity || ticket.updatedAt || ticket.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketDetail(ticket);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <FiChevronRight className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <FiInbox className="text-3xl mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No tickets found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeTab !== 'all' ? `No ${activeTab} tickets matching your filter.` : 'You haven\'t submitted any tickets yet.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Details Modal */}
        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onTicketUpdated={handleTicketUpdated}
        />

      </div>
    );
  }

  /* -------------------------------------------------------------
   * RENDER: SUPPORT FAQ / OVERVIEW VIEW
   * ----------------------------------------------------------- */
  return (
    <div className="max-w-8xl mx-auto pb-16">
      <h1 className="text-3xl font-bold text-[#1e293b] mb-8">Support</h1>

      {/* Search Bar */}
      <div className="relative mb-6 shadow-xs rounded-lg">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-blue-500 text-lg" />
        </div>
        <input 
          type="text" 
          placeholder="Search for help articles, guides, or FAQs..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Track Requests Card */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Track your requests</h2>
          <p className="text-sm text-gray-500">Check the status of your active support cases.</p>
        </div>
        <button 
          onClick={() => setView('tickets')}
          className="bg-white hover:bg-blue-50 text-blue-500 border border-blue-200 font-semibold py-2.5 px-6 rounded-md shadow-xs transition-colors text-sm w-full sm:w-auto cursor-pointer"
        >
          View My Tickets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (FAQs) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ</h2>
          <div className="space-y-1">
            {faqs.map((faq, index) => (
              <FaqItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={!!openFaqs[index]}
                onClick={() => toggleFaq(index)}
              />
            ))}
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6 pt-14 lg:pt-12">
          
          {/* Blue Widget */}
          <div className="bg-[#3b82f6] rounded-lg p-8 shadow-xs text-white">
            <h3 className="text-xl font-bold italic mb-4">Precision 24/7</h3>
            <p className="text-sm text-blue-50 leading-relaxed font-medium">
              Our expert metrologists are always reviewing ticket submissions to ensure your conversion is handled with sub-millimeter accuracy.
            </p>
          </div>

          {/* Contact Support Widget */}
          <div className="bg-white rounded-lg p-8 shadow-xs border border-gray-200 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
              Our support engineers are ready to assist you.
            </p>
            <button 
              onClick={() => {
                setPreviousView('faq');
                setView('submit-ticket');
              }}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-xs transition-colors text-sm cursor-pointer"
            >
              Contact Support
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
