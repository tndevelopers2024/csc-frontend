import React, { useState } from 'react';
import { FiCalendar, FiFileText, FiCheckCircle, FiSearch, FiChevronDown } from 'react-icons/fi';
import { BiHistory, BiReceipt } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function Billing() {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'CAD Usage History', 'Invoice History'];

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1e293b]">CAD wallet & Billing</h1>
        
        {/* Only show Buy CAD Hours if not on Overview (based on screenshots), or always show. Let's always show it, or strictly match screenshot. Screenshot 1 lacks it, 2 & 3 have it. I'll show it conditionally just in case, but it's likely meant to be there always. Let's just put it. */}
        {activeTab !== 'Overview' && (
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-sm transition-colors flex items-center shrink-0 w-max text-sm">
            <span className="mr-1 text-lg font-normal">+</span> Buy CAD Hours
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-colors relative ${
              activeTab === tab
                ? 'text-[#3b82f6]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#3b82f6] rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">This Month's CAD Hours Usage</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-[#3b82f6]">0</span>
                <span className="text-sm font-semibold text-gray-500">hrs</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Free Hours Used</h3>
                <span className="text-[13px] font-bold text-[#3b82f6]">0/10 hrs</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto">
                <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Outstanding Balance</h3>
              <div className="text-4xl font-bold text-[#f97316]">$0.00</div>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 border-l-4 border-l-[#3b82f6] p-4 flex items-center">
            <FiCalendar className="text-[#3b82f6] text-xl mr-3" />
            <span className="text-sm font-medium text-gray-700">Your next invoice will be generated on the 1st of the month</span>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Project Billing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Project Billing — October</h2>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[300px]">
                <BiReceipt className="text-4xl text-[#3b82f6] mb-3" />
                <p className="text-sm font-medium text-gray-500">No project billing found for this period</p>
              </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Outstanding Invoices</h2>
              </div>
              <div className="flex-1 p-8 pb-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                  <FiCheckCircle className="text-[#3b82f6] text-2xl" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Your account is up to date</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-8 leading-relaxed">
                  No outstanding invoices. All your payments have been processed successfully.
                </p>
                <div className="w-full bg-gray-50 rounded-lg p-6 flex flex-col items-center border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Outstanding Balance</span>
                  <span className="text-3xl font-bold text-gray-900">$0.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'CAD Usage History' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Project Name or ID" 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative w-48">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>

            <div className="relative w-48">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Usage Type: All</option>
                <option>Free Hours</option>
                <option>Paid Hours</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center text-center">
            <BiHistory className="text-5xl text-[#3b82f6] mb-5" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No usage history yet</h2>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Start your first Scan-to-CAD project to see your hourly credits in action.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'Invoice History' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Project Name or ID" 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative w-48">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Status Type: All</option>
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>

            <div className="relative w-48">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center text-center">
            <HiOutlineDocumentText className="text-5xl text-[#3b82f6] mb-5" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No invoices found</h2>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Invoices are generated on the 1st of every month after your first project completion.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
