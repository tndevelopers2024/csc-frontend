import React, { useState, useEffect } from 'react';
import { FiX, FiUploadCloud, FiArrowRight, FiInfo, FiTag, FiCheck } from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { MdOutlinePayments } from 'react-icons/md';
import { FaBolt, FaCheckCircle } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function ApprovalModal({ isOpen, onClose, project, onApprovePO, onApprovePayment }) {
  if (!isOpen || !project) return null;
  
  const [poFile, setPoFile] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Fetch available coupons assigned to this user
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/my-available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setAvailableCoupons(list);
        }
      } catch (err) {
        console.error('Error fetching user coupons:', err);
      }
    };

    fetchCoupons();
  }, []);

  const handlePoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPoFile(e.target.files[0]);
    }
  };

  const shortId = `CSC-${project._id.substring(project._id.length - 8).toUpperCase()}`;
  const baseCost = (project.billableHours || 0) * 50; // $50/hour rate based on Quotations.jsx
  
  // Calculate discount & final cost
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalCost = Math.max(0, baseCost - discountAmount);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setCouponError('');
    setCouponLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, projectId: project._id })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponCode(code);
      } else {
        setCouponError(data.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('Network error while validating coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const redeemCouponIfAny = async () => {
    if (appliedCoupon && appliedCoupon.coupon?.code) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL}/coupons/redeem`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            code: appliedCoupon.coupon.code,
            projectId: project._id
          })
        });
      } catch (err) {
        console.error('Error redeeming coupon:', err);
      }
    }
  };

  const handleApproveWithPO = async () => {
    await redeemCouponIfAny();
    onApprovePO(poFile);
  };

  const handleApproveWithPayment = async () => {
    await redeemCouponIfAny();
    onApprovePayment();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Approve & Start Project</h2>
            <p className="text-sm text-gray-500">Select your preferred method to authorize Project {shortId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        {totalCost === 0 && baseCost === 0 ? (
          <div className="p-8 bg-gray-50/50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sufficient Free Hours</h3>
            <p className="text-gray-600 mb-8 max-w-md">
              You have enough free CAD hours to completely cover the cost of this project. No payment or PO is required.
            </p>
            <div className="bg-white rounded-lg p-5 border border-gray-100 w-full max-w-sm mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-500 uppercase">Estimated Hours</span>
                <span className="text-sm font-bold text-gray-900">{project.estimatedHours} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase">Cost to you</span>
                <span className="text-sm font-bold text-green-600">$0.00</span>
              </div>
            </div>
            <button 
              onClick={handleApproveWithPayment}
              className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Confirm & Start Project <FiArrowRight />
            </button>
          </div>
        ) : (
          <div className="p-8 flex flex-col gap-6 bg-gray-50/50">

            {/* Coupon Code Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiTag size={15} />
                  </span>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">One-Time CAD Hours Coupon</span>
                </div>
                {appliedCoupon && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1">
                    <FiCheck /> '{appliedCoupon.coupon.code}' applied: {appliedCoupon.hoursApplied} hrs used (-${appliedCoupon.discountAmount.toFixed(2)})
                  </span>
                )}
              </div>

              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Available for you:</span>
                  {availableCoupons.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <FiTag size={11} /> {c.code} ({c.hours || c.discountValue || 0} hrs CAD)
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g. FREE5HRS)"
                  disabled={Boolean(appliedCoupon)}
                  className="flex-1 max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                {!appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs px-3 py-2 rounded-lg border border-gray-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedCoupon && appliedCoupon.hoursRetained > 0 && (
                <div className="mt-2.5 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 flex items-center justify-between">
                  <span>
                    <strong>Hours Retained:</strong> {appliedCoupon.hoursRetained} unused hr(s) from this coupon will be retained in your account balance!
                  </span>
                  <span className="font-bold text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded uppercase">
                    +{appliedCoupon.hoursRetained} hrs saved
                  </span>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{couponError}</p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column (Enterprise PO) */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 relative shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                    <BsFileEarmarkArrowUp size={24} />
                  </div>
                  <div className="bg-[#1e293b] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                    ENTERPRISE
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 mb-3">Add Purchase Order (PO)</h3>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                  Best for industrial clients with existing procurement workflows. Uploading a valid PO will trigger immediate project scheduling by our metrology team.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center mb-6 bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePoChange} accept=".pdf,.jpg,.jpeg,.png" />
                  <FiUploadCloud size={32} className="text-gray-400 mb-3" />
                  {poFile ? (
                    <p className="text-sm font-bold text-blue-600">{poFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-700 mb-1">Drop PO document here</p>
                      <p className="text-xs text-gray-500">PDF or JPEG (Max 10MB)</p>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleApproveWithPO}
                  disabled={!poFile}
                  className={`w-full font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4 ${
                    poFile ? 'bg-[#3b82f6] hover:bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit PO & Start <FiArrowRight />
                </button>
                
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <FiInfo className="text-gray-400" /> Next: Our team verifies the PO within 2 business hours.
                </p>
              </div>

              {/* Right Column (Instant Start) */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 relative shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                    <MdOutlinePayments size={24} />
                  </div>
                  <div className="bg-[#1d4ed8] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                    INSTANT START
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 mb-3">Pay for Project</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Authorize payment directly via Credit Card or PayPal. Ideal for rapid turnaround times and immediate data processing queue placement.
                </p>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                    <span>Base Cost ({project.billableHours || 0} hrs @ $50/hr)</span>
                    <span>${baseCost.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <>
                      <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                        <span>Coupon Hours Applied ({appliedCoupon.coupon.code}: {appliedCoupon.hoursApplied} hrs)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                      {appliedCoupon.hoursRetained > 0 && (
                        <div className="flex justify-between items-center text-[11px] text-blue-600 font-bold bg-blue-50/80 p-1.5 rounded">
                          <span>Hours Retained for your Account:</span>
                          <span>+{appliedCoupon.hoursRetained} hrs</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">PROJECT TOTAL</span>
                    <span className="text-lg font-bold text-gray-900">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  {totalCost === 0 ? (
                    <button 
                      onClick={handleApproveWithPayment}
                      className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
                    >
                      Confirm & Start (100% Free with Coupon Hours) <FiArrowRight />
                    </button>
                  ) : (
                    <div className="mb-4 relative z-10 w-full min-h-[48px]">
                      <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
                        <PayPalButtons
                          style={{ layout: "vertical", shape: "rect", height: 48, label: "pay" }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [
                                {
                                  description: `Project ${shortId}`,
                                  amount: {
                                    value: totalCost.toFixed(2),
                                  },
                                },
                              ],
                            });
                          }}
                          onApprove={(data, actions) => {
                            return actions.order.capture().then((details) => {
                              handleApproveWithPayment();
                            });
                          }}
                          onError={(err) => {
                            console.error("PayPal Checkout Error:", err);
                            alert("There was an error processing your payment. Please try again.");
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FaBolt className="text-yellow-500" /> Next: Project enters high-priority queue instantly.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
