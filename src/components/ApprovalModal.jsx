import React, { useState } from 'react';
import { FiX, FiUploadCloud, FiArrowRight, FiCreditCard, FiInfo } from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { MdOutlinePayments } from 'react-icons/md';
import { FaBolt, FaCheckCircle } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function ApprovalModal({ isOpen, onClose, project, onApprovePO, onApprovePayment }) {
  if (!isOpen || !project) return null;
  
  const [poFile, setPoFile] = useState(null);

  const handlePoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPoFile(e.target.files[0]);
    }
  };

  const shortId = `CSC-${project._id.substring(project._id.length - 8).toUpperCase()}`;
  const totalCost = (project.billableHours || 0) * 50; // $50/hour rate based on Quotations.jsx

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
        {totalCost === 0 ? (
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
              onClick={() => onApprovePayment()}
              className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Confirm & Start Project <FiArrowRight />
            </button>
          </div>
        ) : (
          <div className="p-8 flex flex-col md:flex-row gap-8 bg-gray-50/50">
            
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
                onClick={() => onApprovePO(poFile)}
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
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Authorize payment directly via Credit Card or CAD Wallet. Ideal for rapid turnaround times and immediate data processing queue placement.
              </p>

              <div className="bg-gray-50 rounded-lg p-5 flex justify-between items-center mb-8 border border-gray-100">
                <span className="text-sm font-bold text-gray-900">PROJECT TOTAL</span>
                <span className="text-lg font-bold text-gray-900">${totalCost.toFixed(2)}</span>
              </div>

              <div className="mt-auto">
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
                          onApprovePayment();
                        });
                      }}
                      onError={(err) => {
                        console.error("PayPal Checkout Error:", err);
                        alert("There was an error processing your payment. Please try again.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
                
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <FaBolt className="text-yellow-500" /> Next: Project enters high-priority queue instantly.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
