import React, { useState, useEffect } from 'react';
import { FiBellOff, FiBell, FiCheck, FiInfo, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));

      // Navigate to project if applicable
      if (projectId) {
        navigate(`/dashboard/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'QUOTE_READY': return <FiFileText className="text-blue-500" />;
      case 'FILES_DELIVERED': return <FiCheck className="text-green-500" />;
      default: return <FiInfo className="text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-medium">Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-8xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1e293b]">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold text-blue-500 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center text-center mt-2">
          <FiBellOff className="text-5xl text-[#3b82f6] mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No new notifications</h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed">
            We'll notify you when there's an update on your projects or account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div 
                key={notification._id}
                onClick={() => markAsRead(notification._id, notification.projectId)}
                className={`p-6 flex items-start gap-4 cursor-pointer transition-colors ${
                  notification.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm border border-blue-100'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
