import React, { useState, useEffect } from 'react';
import { FiMail, FiMonitor, FiInfo, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Toggle = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 shrink-0 ${checked ? 'bg-[#3b82f6]' : 'bg-gray-300'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
  </button>
);

const SettingRow = ({ title, description, checked, onChange, isLast }) => (
  <div className={`py-5 flex items-start justify-between ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <div className="pr-8">
      <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
    <div className="shrink-0 pt-1">
      <Toggle checked={checked} onChange={onChange} />
    </div>
  </div>
);

export default function Settings() {
  const [emailPrefs, setEmailPrefs] = useState({
    projectStatus: true,
    invoiceGen: true,
    newQuotes: true,
    marketing: false,
    security: true,
  });

  const { user } = useOutletContext();
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const [platformPrefs, setPlatformPrefs] = useState({
    newQuotes: true,
    projectStatus: true,
    engineerAssign: false,
    fileDelivery: true,
    invoiceGen: true,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPlatformPrefs({ ...platformPrefs, ...user.notificationPreferences });
    }
  }, [user]);

  const handleDiscard = () => {
    if (user?.notificationPreferences) {
      setPlatformPrefs({ ...platformPrefs, ...user.notificationPreferences });
    } else {
      setPlatformPrefs({
        newQuotes: true,
        projectStatus: true,
        engineerAssign: false,
        fileDelivery: true,
        invoiceGen: true,
      });
    }
    setEmailPrefs({
      projectStatus: true,
      invoiceGen: true,
      newQuotes: true,
      marketing: false,
      security: true,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/preferences`, 
        { platformPrefs }, 
        { headers: { 'x-auth-token': token } }
      );
      showToast('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Failed to save preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl pb-16 relative">
      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast.message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`px-6 py-3.5 rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#10b981] border-[#10b981] text-white'}`}>
          {toast.type === 'error' ? <FiXCircle className="text-lg" /> : <FiCheckCircle className="text-lg" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-[#1e293b] mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Email Preferences Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <FiMail className="text-[#3b82f6] text-lg mr-3" />
            <h2 className="text-sm font-bold text-gray-900">Email Preferences</h2>
          </div>
          <div className="px-6">
            <SettingRow 
              title="Project Status Updates" 
              description="Receive automated alerts when your scan processing reaches key milestones (Queued, Processing, Complete)." 
              checked={emailPrefs.projectStatus} 
              onChange={() => setEmailPrefs({...emailPrefs, projectStatus: !emailPrefs.projectStatus})}
            />
            <SettingRow 
              title="Invoice Generation" 
              description="Direct delivery of digital tax invoices and billing receipts once a project is finalized or subscription renews." 
              checked={emailPrefs.invoiceGen} 
              onChange={() => setEmailPrefs({...emailPrefs, invoiceGen: !emailPrefs.invoiceGen})}
            />
            <SettingRow 
              title="New Quotations" 
              description="Instant notification when technical sales staff have uploaded a custom quote for complex metrology services." 
              checked={emailPrefs.newQuotes} 
              onChange={() => setEmailPrefs({...emailPrefs, newQuotes: !emailPrefs.newQuotes})}
            />
            <SettingRow 
              title="Marketing & Newsletter" 
              description="Stay updated with the latest 3D scanning hardware releases, firmware updates, and metrology best practices." 
              checked={emailPrefs.marketing} 
              onChange={() => setEmailPrefs({...emailPrefs, marketing: !emailPrefs.marketing})}
            />
            <SettingRow 
              title="Security Alerts" 
              description="Critical notifications regarding new device logins, password changes, and sensitive data access logs." 
              checked={emailPrefs.security} 
              onChange={() => setEmailPrefs({...emailPrefs, security: !emailPrefs.security})}
              isLast={true}
            />
          </div>
        </div>

        {/* Platform Notifications Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <FiMonitor className="text-[#3b82f6] text-lg mr-3" />
            <h2 className="text-sm font-bold text-gray-900">Platform Notifications</h2>
          </div>
          <div className="px-6">
            <SettingRow 
              title="New Quotations" 
              description="Instant notification when technical sales staff have uploaded a custom quote for complex metrology services." 
              checked={platformPrefs.newQuotes} 
              onChange={() => setPlatformPrefs({...platformPrefs, newQuotes: !platformPrefs.newQuotes})}
            />
            <SettingRow 
              title="Project Status Updates" 
              description="Receive automated alerts when your scan processing reaches key milestones (Queued, Processing, Complete)." 
              checked={platformPrefs.projectStatus} 
              onChange={() => setPlatformPrefs({...platformPrefs, projectStatus: !platformPrefs.projectStatus})}
            />
            <SettingRow 
              title="Engineer assignment" 
              description="Direct delivery of digital tax invoices and billing receipts once a project is finalized or subscription renews." 
              checked={platformPrefs.engineerAssign} 
              onChange={() => setPlatformPrefs({...platformPrefs, engineerAssign: !platformPrefs.engineerAssign})}
            />
            <SettingRow 
              title="File delivery" 
              description="Direct delivery of digital tax invoices and billing receipts once a project is finalized or subscription renews." 
              checked={platformPrefs.fileDelivery} 
              onChange={() => setPlatformPrefs({...platformPrefs, fileDelivery: !platformPrefs.fileDelivery})}
            />
            <SettingRow 
              title="Invoice Generation" 
              description="Direct delivery of digital tax invoices and billing receipts once a project is finalized or subscription renews." 
              checked={platformPrefs.invoiceGen} 
              onChange={() => setPlatformPrefs({...platformPrefs, invoiceGen: !platformPrefs.invoiceGen})}
              isLast={true}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="rounded-lg p-4 flex items-center justify-end space-x-6 shadow-md mt-2">
          <button 
            onClick={handleDiscard}
            className="text-gray-500 font-bold text-sm hover:text-gray-300 transition-colors"
          >
            Discard changes
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`text-white font-bold py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center text-sm ${isSaving ? 'bg-blue-400' : 'bg-[#3b82f6] hover:bg-blue-600'}`}>
            <FiSave className="mr-2 text-lg" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="bg-[#f0f4ff] rounded-lg border border-blue-100 p-5 mt-6">
          <div className="flex items-center text-[#1e3a8a] mb-2 font-bold text-xs uppercase tracking-wide">
            <FiInfo className="mr-2 text-base" />
            Data Privacy Note
          </div>
          <p className="text-xs text-[#1e3a8a] leading-relaxed">
            Convert Scan to CAD handles your contact information with extreme care. Email notifications are encrypted and sent via secure industrial-grade gateways. You can audit your notification history in the <a href="#" className="underline font-semibold hover:text-blue-800">Activity Logs</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
