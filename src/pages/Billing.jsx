import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FiCalendar, FiFileText, FiCheckCircle, FiSearch, FiChevronDown, FiClock, FiAlertCircle, FiTag, FiGift, FiCheck, FiX, FiDownload } from 'react-icons/fi';
import { BiHistory, BiReceipt, BiDownload } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { MdOutlinePayments } from 'react-icons/md';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function Billing() {
  const { user, openBuyHoursModal } = useOutletContext();
  const [activeTab, setActiveTab] = useState('Overview');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedProjectToPay, setSelectedProjectToPay] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);

  const fetchMyCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/my-available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyCoupons(data);
      }
    } catch (err) {
      console.error('Error fetching available coupons', err);
    }
  };

  const handleRedeemCoupon = async (codeToRedeem) => {
    const code = (codeToRedeem || couponCode).trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponMsg(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (res.ok) {
        setCouponMsg({ type: 'success', text: data.message });
        setCouponCode('');
        fetchMyCoupons();
      } else {
        setCouponMsg({ type: 'error', text: data.message || 'Failed to redeem coupon.' });
      }
    } catch (err) {
      console.error('Error redeeming coupon:', err);
      setCouponMsg({ type: 'error', text: 'Network error while redeeming coupon.' });
    } finally {
      setCouponLoading(false);
    }
  };

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
    fetchMyCoupons();
  }, []);

  const tabs = ['Overview', 'CAD Usage History', 'Invoice History'];

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  
  // Helper: whether quote was accepted and project is active/in-progress/completed (not unaccepted quotes)
  const isAcceptedOrActive = (p) => !['Pending Quote', 'Quote Ready', 'Revision Requested', 'Rejected', 'Under Review'].includes(p.status);

  // Helper: whether project is completed or delivered
  const isProjectCompleted = (p) => ['Completed', 'Delivered'].includes(p.status) || (p.completedFiles && p.completedFiles.length > 0);

  const thisMonthProjects = projects.filter(p => {
    const d = new Date(p.createdAt);
    return isAcceptedOrActive(p) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthHours = thisMonthProjects.reduce((sum, p) => sum + (p.billableHours || p.estimatedHours || 0) + (p.freeHoursApplied || 0), 0);
  
  const freeHoursRemaining = user?.freeHoursRemaining || 0;
  const freeHoursUsed = projects
    .filter(isAcceptedOrActive)
    .reduce((sum, p) => sum + (p.freeHoursApplied || 0), 0);
  const maxFreeHours = Math.max(3, freeHoursRemaining + freeHoursUsed);
  const freeHoursPercent = maxFreeHours === 0 ? 0 : Math.min(100, (freeHoursUsed / maxFreeHours) * 100);
  
  // Free hours card should be removed once it's used
  const isFreeHoursUsed = freeHoursRemaining <= 0 || (freeHoursUsed >= 3 && freeHoursRemaining <= 0);

  // An invoice should NOT be an outstanding invoice before the PO date or before project completion.
  // Unaccepted quotes (e.g. Quote Ready, Revision Requested) must NEVER be treated as outstanding invoices.
  const isInvoiceOutstanding = (p) => {
    if (!p.billableHours || p.billableHours <= 0) return false;
    if (!isAcceptedOrActive(p)) return false; // Quote not accepted yet
    const now = new Date();
    const isCompleted = isProjectCompleted(p);
    const isPoDateReached = Boolean(p.paymentDeadline && now >= new Date(p.paymentDeadline));
    return isCompleted || isPoDateReached;
  };

  const outstandingProjects = projects.filter(isInvoiceOutstanding);
  const totalOutstanding = outstandingProjects.reduce((sum, p) => {
    const originalCost = (p.billableHours || 0) * 50;
    const discount = p.couponApplied?.discountAmount || 0;
    return sum + Math.max(0, originalCost - discount);
  }, 0);

  // Once the project is completed, then only show the project billing & pay option here
  const projectBillingList = projects.filter(p => {
    return isProjectCompleted(p);
  });

  const currentMonthTotalDue = projectBillingList
    .filter(p => p.billableHours > 0)
    .reduce((sum, p) => {
      const originalCost = (p.billableHours || 0) * 50;
      const discount = p.couponApplied?.discountAmount || 0;
      return sum + Math.max(0, originalCost - discount);
    }, 0);

  return (
    <div className="max-w-8xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1e293b]">CAD wallet & Billing</h1>
        
        <button 
          onClick={openBuyHoursModal} 
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-sm transition-colors flex items-center shrink-0 w-max text-sm gap-2"
        >
          <FiClock className="text-base" /> Buy CAD Hours
        </button>
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
          <div className={`grid grid-cols-1 ${!isFreeHoursUsed ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">This Month's CAD Hours Usage</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-[#3b82f6]">{thisMonthHours}</span>
                <span className="text-sm font-semibold text-gray-500">hrs</span>
              </div>
            </div>

            {!isFreeHoursUsed && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Free Hours Used</h3>
                  <span className="text-[13px] font-bold text-[#3b82f6]">{freeHoursUsed}/{maxFreeHours} hrs</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto">
                  <div className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-500" style={{ width: `${freeHoursPercent}%` }}></div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Outstanding Balance</h3>
              <div className="flex items-center gap-2">
                <div className={`text-4xl font-bold ${totalOutstanding > 0 ? 'text-[#f97316]' : 'text-gray-900'}`}>
                  ${totalOutstanding.toFixed(2)}
                </div>
                {totalOutstanding > 0 && <FiAlertCircle className="text-[#f97316] text-xl" />}
              </div>
            </div>
          </div>

          {/* One-Time CAD Hours Coupon Redemption Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FiTag size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Have a CAD Hours Coupon Code?</h3>
                  <p className="text-xs text-gray-500">
                    Redeem your admin-issued one-time coupon here to add CAD hours directly to your free hours balance, or apply it during quote approval.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER COUPON CODE"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 min-w-[200px]"
                />
                <button
                  onClick={() => handleRedeemCoupon()}
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  {couponLoading ? 'Redeeming...' : 'Redeem to Account'}
                </button>
              </div>
            </div>

            {couponMsg && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-medium ${
                couponMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {couponMsg.text}
              </div>
            )}

            {myCoupons.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Available Coupons:</span>
                {myCoupons.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleRedeemCoupon(c.code)}
                    disabled={couponLoading}
                    className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors flex items-center gap-1"
                    title="Click to redeem directly to your account"
                  >
                    <FiGift size={11} /> {c.code} ({c.hours || c.discountValue || 0} hrs)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alert Banner */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 border-l-4 border-l-[#3b82f6] p-4 flex items-center">
            <FiCalendar className="text-[#3b82f6] text-xl mr-3" />
            <span className="text-sm font-medium text-gray-700">Your next invoice will be generated on the 1st of the month</span>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Project Billing - Leftside scrollable container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[520px]">
              <div className="p-4 px-5 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Project Billing — {currentMonthName}</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Project invoices, billing details and direct payment</p>
                </div>
                {currentMonthTotalDue > 0 && (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    Total Due: ${currentMonthTotalDue.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto min-h-0">
                {projectBillingList.length > 0 ? (
                  <div className="space-y-2.5">
                    {projectBillingList.map((p) => {
                      const shortId = `CSC-${p._id.substring(p._id.length - 8).toUpperCase()}`;
                      const invNumber = `INV-${p._id.substring(p._id.length - 6).toUpperCase()}`;
                      const isPaid = !p.billableHours || p.billableHours === 0;
                      const originalCost = (p.billableHours || 0) * 50;
                      const discount = p.couponApplied?.discountAmount || 0;
                      const finalCost = Math.max(0, originalCost - discount);
                      const isCompleted = ['Completed', 'Delivered'].includes(p.status) || (p.completedFiles && p.completedFiles.length > 0);
                      const hasPoDate = Boolean(p.paymentDeadline);
                      const isPoDue = hasPoDate && new Date() >= new Date(p.paymentDeadline);
                      const hasInvoicePdf = p.invoiceFiles && p.invoiceFiles.length > 0;
                      const latestInvoice = hasInvoicePdf ? p.invoiceFiles[p.invoiceFiles.length - 1] : null;

                      return (
                        <div key={p._id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-200 hover:shadow-sm transition-all bg-white flex flex-col gap-2">
                          {/* Row 1: Title, IDs, and Status badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Link 
                                to={`/dashboard/projects/${p._id}`}
                                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors truncate max-w-[170px] sm:max-w-[220px]"
                              >
                                {p.title}
                              </Link>
                              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                {shortId}
                              </span>
                              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-100 shrink-0">
                                {invNumber}
                              </span>
                            </div>

                            <div className="shrink-0">
                              {isPaid ? (
                                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                                  <FiCheck size={11} /> Paid
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Project Completed
                                </span>
                              ) : hasPoDate ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isPoDue ? 'text-red-700 bg-red-50 border-red-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                                }`}>
                                  {isPoDue ? 'PO Due Today' : 'PO Active'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {p.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Billing specs, link, and Pay Now button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 border-t border-gray-100 text-xs">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-gray-500">
                              <span>
                                {p.paymentDeadline ? (
                                  <>PO Date: <strong className="text-gray-700 font-medium">{new Date(p.paymentDeadline).toLocaleDateString('en-GB')}</strong></>
                                ) : (
                                  <>Created: <strong className="text-gray-700 font-medium">{new Date(p.createdAt).toLocaleDateString('en-GB')}</strong></>
                                )}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span>{p.billableHours || 0} hrs @ $50/hr</span>
                              <span className="text-gray-300">•</span>
                              <span className="font-bold text-gray-900">${finalCost.toFixed(2)}</span>

                              {p.couponApplied?.code && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                                  Coupon -${discount.toFixed(0)}
                                </span>
                              )}

                              {hasInvoicePdf ? (
                                <a
                                  href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${latestInvoice.filename}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 ml-1"
                                >
                                  <FiDownload size={12} /> PDF
                                </a>
                              ) : (
                                <Link
                                  to={`/dashboard/projects/${p._id}`}
                                  className="text-gray-400 hover:text-blue-600 font-medium ml-1"
                                >
                                  Details
                                </Link>
                              )}
                            </div>

                            {!isPaid && (
                              <button
                                onClick={() => setSelectedProjectToPay(p)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3.5 rounded-md shadow-sm transition-all flex items-center justify-center gap-1.5 self-end sm:self-auto shrink-0"
                              >
                                <MdOutlinePayments size={14} /> Pay Now (${finalCost.toFixed(2)})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 h-full flex flex-col items-center justify-center py-16 text-center">
                    <BiReceipt className="text-4xl text-[#3b82f6] mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No completed project billing found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                      Project invoices and direct payment options will appear here once your projects are completed and delivered.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[520px]">
              <div className="p-4 px-5 border-b border-gray-100 shrink-0">
                <h2 className="text-base font-bold text-gray-900">Outstanding Invoices</h2>
              </div>
              <div className="flex-1 p-6 pb-6 flex flex-col items-center justify-center overflow-y-auto">
                {outstandingProjects.length > 0 ? (
                  <>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                      <FiAlertCircle className="text-red-500 text-2xl" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">You have {outstandingProjects.length} overdue invoice{outstandingProjects.length !== 1 ? 's' : ''}</h3>
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
                            return actions.order.capture().then(() => handlePayment(outstandingProjects));
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

        {/* Direct Project Invoice Payment Modal */}
        {selectedProjectToPay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Pay Project Invoice</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    CSC-{selectedProjectToPay._id.substring(selectedProjectToPay._id.length - 8).toUpperCase()} • INV-{selectedProjectToPay._id.substring(selectedProjectToPay._id.length - 6).toUpperCase()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedProjectToPay(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Project</span>
                  <p className="text-sm font-bold text-gray-900">{selectedProjectToPay.title}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Billable Hours ({selectedProjectToPay.billableHours || 0} hrs @ $50/hr)</span>
                    <span className="font-semibold">${((selectedProjectToPay.billableHours || 0) * 50).toFixed(2)}</span>
                  </div>
                  {selectedProjectToPay.couponApplied?.code && (
                    <div className="flex justify-between items-center text-emerald-700 font-bold">
                      <span>Coupon ({selectedProjectToPay.couponApplied.code})</span>
                      <span>-${(selectedProjectToPay.couponApplied.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                    <span>Total Amount Due</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ${Math.max(0, ((selectedProjectToPay.billableHours || 0) * 50) - (selectedProjectToPay.couponApplied?.discountAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {isPaying ? (
                    <div className="w-full bg-[#3b82f6] text-white font-medium py-3 rounded-xl text-center shadow-sm text-sm">
                      Processing payment...
                    </div>
                  ) : (
                    <PayPalButtons 
                      style={{ layout: "vertical", height: 45, label: "pay" }}
                      createOrder={(data, actions) => {
                        const orig = (selectedProjectToPay.billableHours || 0) * 50;
                        const disc = selectedProjectToPay.couponApplied?.discountAmount || 0;
                        const cost = Math.max(0, orig - disc);
                        return actions.order.create({
                          purchase_units: [{
                            description: `Invoice for ${selectedProjectToPay.title}`,
                            amount: { value: cost.toFixed(2) }
                          }]
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(async () => {
                          await handlePayment([selectedProjectToPay]);
                          setSelectedProjectToPay(null);
                        });
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  onClick={() => setSelectedProjectToPay(null)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel and Pay Later
                </button>
              </div>
            </div>
          </div>
        )}
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
