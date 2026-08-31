import React, { useState } from 'react';
import { FiX, FiInfo } from 'react-icons/fi';

export default function RevisionModal({ isOpen, onClose, onSubmitRevision }) {
  if (!isOpen) return null;
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmitRevision({ reason, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Request Quote Revision</h2>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[90%]">
              Please tell us why you need a revision so our engineers can adjust the scope or technical details.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Reason for Revision</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="" disabled>Select a reason</option>
              <option value="Scope Change">Change in scope or requirements</option>
              <option value="Price/Hours">Questions about pricing or hours</option>
              <option value="Timeline">Adjust delivery timeline</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your needs in detail here..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 min-h-[120px] resize-none"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 flex gap-3">
            <FiInfo className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Revisions typically take <strong className="font-bold text-gray-800">1-2 business hours</strong> to process depending on complexity.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!reason}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                reason ? 'bg-[#3b82f6] hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Revision Request
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
