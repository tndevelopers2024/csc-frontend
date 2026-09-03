import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FiCalendar, FiFileText, FiCheckCircle, FiSearch, FiChevronDown, FiClock, FiAlertCircle } from 'react-icons/fi';
import { BiHistory, BiReceipt } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function Billing() {
  const { user, openBuyHoursModal } = useOutletContext();
  const [activeTab, setActiveTab] = useState('Overview');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = async (projectsToPay) => {
    try {
      setIsPaying(true);
      const token = localStorage.getItem('token');
      for (const p of projectsToPay) {
        await fetch(`${import.meta.env.VITE_API_URL}/projects/${p._id}/pay`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Error processing payment', err);
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error('Error fetching projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const tabs = ['Overview', 'CAD Usage History', 'Invoice History'];

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthProjects = projects.filter(p => {
    const d = new Date(p.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthHours = thisMonthProjects.reduce((sum, p) => sum + (p.billableHours || p.estimatedHours || 0) + (p.freeHoursApplied || 0), 0);
  
  const freeHoursRemaining = user?.freeHoursRemaining || 0;
  const freeHoursUsed = projects.reduce((sum, p) => sum + (p.freeHoursApplied || 0), 0);
  const maxFreeHours = freeHoursRemaining + freeHoursUsed;
  const freeHoursPercent = maxFreeHours === 0 ? 0 : Math.min(100, (freeHoursUsed / maxFreeHours) * 100);

  const unpaidProjects = projects.filter(p => p.billableHours > 0);
  const totalOutstanding = unpaidProjects.reduce((sum, p) => sum + (p.billableHours * 50), 0);
  
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const currentMonthUnpaid = unpaidProjects.filter(p => {
    const d = new Date(p.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const currentMonthTotal = currentMonthUnpaid.reduce((sum, p) => sum + (p.billableHours * 50), 0);

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1e293b]">CAD wallet & Billing</h1>
        
        {activeTab !== 'Overview' && (
          <button onClick={openBuyHoursModal} className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-sm transition-colors flex items-center shrink-0 w-max text-sm">
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
        <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">This Month's CAD Hours Usage</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-[#3b82f6]">{thisMonthHours}</span>
                <span className="text-sm font-semibold text-gray-500">hrs</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Free Hours Used</h3>
                <span className="text-[13px] font-bold text-[#3b82f6]">{freeHoursUsed}/{maxFreeHours} hrs</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto">
                <div className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-500" style={{ width: `${freeHoursPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Outstanding Balance</h3>
              <div className="flex items-center gap-2">
                <div className="text-4xl font-bold text-[#f97316]">${totalOutstanding.toFixed(2)}</div>
                {totalOutstanding > 0 && <FiAlertCircle className="text-[#f97316] text-xl" />}
              </div>
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
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Project Billing — {currentMonthName}</h2>
              </div>
              <div className="flex-1 p-6 flex flex-col min-h-[300px]">
                {currentMonthUnpaid.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                      {currentMonthUnpaid.map(p => (
                        <div key={p._id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm font-medium text-gray-700">{p.title}</span>
                          <span className="text-sm font-bold text-gray-900">${(p.billableHours * 50).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Due</span>
                        <span className="text-2xl font-bold text-gray-900">${currentMonthTotal.toFixed(2)}</span>
                      </div>
                      <div className="w-[240px] relative z-0 mt-2">
                        {isPaying ? (
                          <div className="w-full bg-[#3b82f6] text-white font-medium py-2 rounded text-center shadow-sm text-sm">Processing...</div>
                        ) : (
                          <PayPalButtons 
                            style={{ layout: "horizontal", height: 40, label: "pay" }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                purchase_units: [{ amount: { value: currentMonthTotal.toFixed(2) } }]
                              });
                            }}
                            onApprove={(data, actions) => {
                              return actions.order.capture().then(() => handlePayment(currentMonthUnpaid));
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <BiReceipt className="text-4xl text-[#3b82f6] mb-3" />
                    <p className="text-sm font-medium text-gray-500">No project billing found for this period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Outstanding Invoices</h2>
              </div>
              <div className="flex-1 p-8 pb-6 flex flex-col items-center justify-center">
                {unpaidProjects.length > 0 ? (
                  <>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                      <FiAlertCircle className="text-red-500 text-2xl" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">You have {unpaidProjects.length} overdue invoice{unpaidProjects.length !== 1 ? 's' : ''}</h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
                      Your account is currently in a grace period. Please settle the outstanding balance to avoid service interruption for your operations.
                    </p>
                    <div className="w-full bg-gray-50 rounded-lg p-6 flex flex-col items-center border border-gray-100 mb-6">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Outstanding Balance</span>
                      <span className="text-3xl font-bold text-gray-900">${totalOutstanding.toFixed(2)}</span>
                    </div>
                    <div className="w-full relative z-0">
                      {isPaying ? (
                        <div className="w-full bg-[#3b82f6] text-white font-medium py-3 rounded-md text-center shadow-sm">Processing...</div>
                      ) : (
                        <PayPalButtons 
                          style={{ layout: "horizontal", height: 45, label: "pay" }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [{ amount: { value: totalOutstanding.toFixed(2) } }]
                            });
                          }}
                          onApprove={(data, actions) => {
                            return actions.order.capture().then(() => handlePayment(unpaidProjects));
                          }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3 text-center">Secure payment processed via PayPal</p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
        </PayPalScriptProvider>
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

          {/* Empty State or Table */}
          {loading ? (
             <div className="py-20 text-center text-gray-400">Loading history...</div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center text-center">
              <BiHistory className="text-5xl text-[#3b82f6] mb-5" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No usage history yet</h2>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                Start your first Scan-to-CAD project to see your hourly credits in action.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6">Project</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Hours Used</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link to={`/dashboard/projects/${project._id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">
                          {project.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1 uppercase">ID: {project._id.substring(project._id.length - 8)}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-4 px-6 text-center text-sm font-bold text-gray-700">
                        {(project.billableHours || project.estimatedHours || 0) + (project.freeHoursApplied || 0)} hrs
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
