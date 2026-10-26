import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  BiSearch, 
  BiSupport, 
  BiMessageDetail 
} from 'react-icons/bi';
import { 
  FiSend, 
  FiX, 
  FiUser, 
  FiHeadphones, 
  FiClock, 
  FiRefreshCw,
  FiLink 
} from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, awaitingClient: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected ticket for modal / drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reply form state
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('AWAITING CLIENT');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const socket = useSocket();

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/admin/all`, {
        params: {
          status: statusFilter,
          category: categoryFilter,
          search: search.trim(),
          sort: sortBy
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      setTickets(res.data.tickets || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, sortBy]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time socket listeners
  useEffect(() => {
    if (socket) {
      const handleTicketUpdate = (updatedTicket) => {
        setTickets(prev => prev.map(t => (t._id === updatedTicket._id ? updatedTicket : t)));
        if (selectedTicket && selectedTicket._id === updatedTicket._id) {
          setSelectedTicket(updatedTicket);
        }
        fetchTickets();
      };

      socket.on('ticketUpdated', handleTicketUpdate);
      socket.on('newTicket', fetchTickets);
      socket.on('ticketReply', fetchTickets);

      return () => {
        socket.off('ticketUpdated', handleTicketUpdate);
        socket.off('newTicket', fetchTickets);
        socket.off('ticketReply', fetchTickets);
      };
    }
  }, [socket, selectedTicket, fetchTickets]);

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyStatus(ticket.status === 'RESOLVED' ? 'RESOLVED' : 'AWAITING CLIENT');
    setReplyMessage('');
    setReplyError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setReplyMessage('');
    setReplyError('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    setReplyError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/tickets/admin/${selectedTicket._id}/reply`,
        {
          message: replyMessage.trim(),
          status: replyStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );

      // Update local state
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
      setReplyMessage('');
      fetchTickets();
    } catch (err) {
      console.error('Error sending admin reply:', err);
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tickets/admin/${selectedTicket._id}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    if (!selectedTicket) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tickets/admin/${selectedTicket._id}/status`,
        { priority: newPriority },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
    } catch (err) {
      console.error('Error updating ticket priority:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded tracking-wide">IN PROGRESS</span>;
      case 'AWAITING CLIENT':
        return <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded tracking-wide">AWAITING CLIENT</span>;
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded tracking-wide">RESOLVED</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded tracking-wide">OPEN</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded">URGENT</span>;
      case 'High':
        return <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded">HIGH</span>;
      case 'Medium':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium px-2 py-0.5 rounded">MEDIUM</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-medium px-2 py-0.5 rounded">LOW</span>;
    }
  };

  const statCards = [
    { label: 'Total Tickets', count: stats.total, borderColor: 'border-blue-400', subtitle: 'All customer tickets' },
    { label: 'Open / Active', count: stats.open, borderColor: 'border-amber-400', subtitle: 'Requires investigation' },
    { label: 'Awaiting Client', count: stats.awaitingClient, borderColor: 'border-rose-400', subtitle: 'Waiting customer reply' },
    { label: 'Resolved', count: stats.resolved, borderColor: 'border-emerald-400', subtitle: 'Closed cases' },
  ];

  const filters = ['All', 'Open', 'Awaiting Client', 'Resolved'];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <BiSupport className="text-blue-600 text-3xl" />
            <span>Support Tickets</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer issues, reply to tickets, and track resolution status.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-5 border-l-4 ${c.borderColor} shadow-xs border border-gray-100`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.label}</div>
            <div className="text-3xl font-extrabold text-gray-900 mt-1.5">{c.count}</div>
            <div className="text-xs text-gray-400 mt-1">{c.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Filters, Search & Category Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === f
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search, Category & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Data Processing">Data Processing</option>
              <option value="Calibration">Calibration</option>
              <option value="Billing">Billing</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search ID, subject, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

        </div>

      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Ticket ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Last Activity</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Loading support tickets...</p>
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => {
                  const customerName = t.userId ? `${t.userId.firstName || ''} ${t.userId.lastName || ''}`.trim() : 'Unknown';
                  const customerEmail = t.userId?.email || 'No email';

                  return (
                    <tr
                      key={t._id}
                      onClick={() => openTicketModal(t)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="py-4 px-6 text-xs font-bold text-gray-900 tracking-wide whitespace-nowrap">
                        {t.ticketId}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">{customerName}</div>
                        <div className="text-[11px] text-gray-500">{customerEmail}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {t.subject}
                        </div>
                        {t.subtext && (
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {t.subtext}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block bg-[#f1f5f9] text-[#475569] text-xs font-semibold px-2.5 py-1 rounded">
                          {t.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getPriorityBadge(t.priority)}
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                        {t.lastActivity ? formatDistanceToNow(new Date(t.lastActivity), { addSuffix: true }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(t.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketModal(t);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          <BiMessageDetail />
                          <span>Reply</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-700">No tickets found</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADMIN TICKET REPLY & MANAGEMENT MODAL / DRAWER           */}
      {/* ========================================================= */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-base">{selectedTicket.ticketId}</span>
                {getStatusBadge(selectedTicket.status)}
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded font-medium">
                  {selectedTicket.category}
                </span>
                {getPriorityBadge(selectedTicket.priority)}
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Ticket Subject & Customer Summary Banner */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                  {selectedTicket.subtext && (
                    <p className="text-xs text-gray-500 font-medium mb-2">{selectedTicket.subtext}</p>
                  )}
                  
                  {/* Customer Details Pill */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                      <FiUser className="text-blue-500" />
                      {selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>{selectedTicket.userId?.email}</span>
                    {selectedTicket.userId?.mobile && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span>{selectedTicket.userId.mobile}</span>
                      </>
                    )}
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <FiClock className="text-gray-400" />
                      {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm') : ''}
                    </span>
                    {selectedTicket.projectId && (
                      <>
                        <span className="text-gray-400">|</span>
                        <a 
                          href={`/admin/projects/${selectedTicket.projectId._id || selectedTicket.projectId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded"
                        >
                          <FiLink size={12} /> Project: {selectedTicket.projectId.title || 'Linked Project'}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Status / Priority Controls for Admin */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <div className="text-right">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Update Status</label>
                    <select
                      value={selectedTicket.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="AWAITING CLIENT">AWAITING CLIENT</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Messages Thread (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((msg, index) => {
                  const isAgent = msg.senderRole === 'agent' || msg.senderRole === 'admin';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1 px-1">
                        {isAgent ? (
                          <>
                            <span className="font-bold text-blue-700">{msg.senderName || 'ConvertScanToCAD Support'}</span>
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-bold">ADMIN</span>
                            <FiHeadphones className="text-blue-600 text-xs" />
                          </>
                        ) : (
                          <>
                            <FiUser className="text-gray-500 text-xs" />
                            <span className="font-bold text-gray-800">{msg.senderName}</span>
                            <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded font-bold">CUSTOMER</span>
                          </>
                        )}
                        <span className="text-gray-400 ml-1">
                          {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                          isAgent
                            ? 'bg-[#1e40af] text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No conversation messages found.
                </div>
              )}
            </div>

            {/* Admin Reply Area */}
            <div className="p-5 bg-white border-t border-gray-200 shrink-0 space-y-3">
              {replyError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {replyError}
                </div>
              )}

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write your engineering or support reply to the customer..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  
                  {/* Status selector upon sending */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">After replying, set status:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-md px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="AWAITING CLIENT">AWAITING CLIENT</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {submittingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Reply...</span>
                      </>
                    ) : (
                      <>
                        <FiSend />
                        <span>Send Reply to Customer</span>
                      </>
                    )}
                  </button>

                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
