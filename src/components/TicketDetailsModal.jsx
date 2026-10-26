import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiSend, FiCheckCircle, FiClock, FiUser, FiHeadphones } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';

export default function TicketDetailsModal({ ticket, isOpen, onClose, onTicketUpdated }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/tickets/${ticket._id}/reply`,
        { message: replyText.trim() },
        { headers: { 'x-auth-token': token } }
      );

      setReplyText('');
      onTicketUpdated(res.data);
    } catch (err) {
      console.error('Error posting reply:', err);
      setError(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tickets/${ticket._id}/status`,
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      onTicketUpdated(res.data);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded tracking-wide">IN PROGRESS</span>;
      case 'AWAITING CLIENT':
        return <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded tracking-wide">AWAITING CLIENT</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded tracking-wide">RESOLVED</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-sm">{ticket.ticketId}</span>
            {getStatusBadge(ticket.status)}
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
              {ticket.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Title & Metadata */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{ticket.subject}</h2>
          {ticket.subtext && (
            <p className="text-xs text-gray-500 font-medium">{ticket.subtext}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiClock className="text-gray-400" />
              Created: {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              Priority: <strong className="text-gray-700 font-semibold">{ticket.priority || 'Medium'}</strong>
            </span>
          </div>
        </div>

        {/* Message Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg, index) => {
              const isCustomer = msg.senderRole === 'customer';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1 px-1">
                    {isCustomer ? (
                      <>
                        <span>{msg.senderName}</span>
                        <FiUser className="text-blue-500 text-xs" />
                      </>
                    ) : (
                      <>
                        <FiHeadphones className="text-emerald-600 text-xs" />
                        <span className="font-semibold text-emerald-700">{msg.senderName}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">SUPPORT</span>
                      </>
                    )}
                    <span className="text-gray-400 ml-1">
                      {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                      isCustomer
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No conversation messages yet.
            </div>
          )}
        </div>

        {/* Reply Box & Footer */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-3">
          <form onSubmit={handleSendReply} className="flex gap-2 items-end">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to the engineering team..."
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="px-4 py-2.5 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0 h-[46px]"
            >
              <FiSend />
              <span>{sending ? 'Sending...' : 'Reply'}</span>
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <div className="text-gray-500">
              Need to close or reopen this case?
            </div>
            <div className="flex items-center gap-2">
              {ticket.status === 'RESOLVED' ? (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('OPEN')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Reopen Ticket
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                >
                  <FiCheckCircle />
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
