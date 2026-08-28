import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';

export default function Quotations() {
  const navigate = useNavigate();

  // Change to [] to see the empty state
  const [quotes, setQuotes] = useState([
    {
      id: 'Q-2026-047',
      projectTitle: 'Turbo Housing Assembly',
      projectMeta: 'STEP • Reverse Engineering',
      date: 'Jun 27',
      status: 'Quote ready',
      hours: '12 hrs',
      price: '$840',
      discount: 'Promo code applied',
      discountActive: true
    },
    {
      id: 'Q-2026-046',
      projectTitle: 'Valve Body Assembly',
      projectMeta: 'IGES • Surface Modeling',
      date: 'Jun 25',
      status: 'Quote ready',
      hours: '8 hrs',
      price: '$560',
      discount: 'No promo code applied',
      discountActive: false
    },
    {
      id: 'Q-2026-045',
      projectTitle: 'Engine Bracket',
      projectMeta: 'SolidWorks • RE',
      date: 'Jun 20',
      status: 'Approved',
      hours: '6 hrs',
      price: '$420',
      discount: 'Promo code applied',
      discountActive: true
    },
    {
      id: 'Q-2026-041',
      projectTitle: 'Pump Casing',
      projectMeta: 'STEP • Reverse...',
      date: 'Jun 10',
      status: 'Under review',
      hours: '—',
      price: '—',
      discount: '—',
      discountActive: null
    }
  ]);

  const renderStatus = (status) => {
    switch (status) {
      case 'Quote ready':
        return <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md text-xs font-bold shadow-sm border border-orange-100">Quote ready</span>;
      case 'Approved':
        return <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-bold shadow-sm border border-green-100">Approved</span>;
      case 'Under review':
        return <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold shadow-sm border border-blue-100">Under review</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const renderActions = (status) => {
    if (status === 'Quote ready') {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 text-xs rounded transition-colors">Approve</button>
          <button className="bg-[#f97316] hover:bg-orange-600 text-white font-semibold py-1.5 px-3 text-xs rounded transition-colors">Revision requested</button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Quote PDF</button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2 w-32">
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 text-xs rounded transition-colors">Details</button>
        </div>
      );
    }
  };

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b] mb-1">My Quotations</h1>
        <p className="text-gray-500 text-sm">Approve or review your quotes</p>
      </div>

      {quotes.length === 0 ? (
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
                {quotes.map((quote, idx) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors align-top bg-white">
                    <td className="py-6 px-6 text-sm text-gray-600">{quote.id}</td>
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
                      {renderActions(quote.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
