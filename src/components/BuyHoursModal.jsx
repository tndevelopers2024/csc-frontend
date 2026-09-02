import React, { useState } from 'react';
import { FiX, FiMinus, FiPlus, FiLock } from 'react-icons/fi';
import { BsCreditCard, BsPaypal } from 'react-icons/bs';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function BuyHoursModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [hours, setHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const pricePerHour = 50;

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  const handleClose = () => {
    setStep(1);
    setHours(1);
    setPaymentMethod('card');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="text-xl" />
        </button>

        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10 relative px-4">
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
            <div className="flex justify-between w-full relative z-10">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mb-2 transition-colors ${
                  step === 1 ? 'bg-[#3b82f6] text-white' : 'bg-[#e5f0ff] text-[#3b82f6]'
                }`}>
                  1
                </div>
                <span className="text-xs font-bold text-gray-900">Select Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mb-2 transition-colors ${
                  step === 2 ? 'bg-[#3b82f6] text-white' : 'bg-white border border-gray-200 text-[#3b82f6]'
                }`}>
                  2
                </div>
                <span className="text-xs font-bold text-gray-900">Payment</span>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Add credit hours</h2>
              <p className="text-sm text-gray-500 mb-8">Rate for: Global (USD)</p>

              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-blue-500 rounded-lg transition-colors text-xl font-bold border border-gray-100"
                >
                  <FiMinus />
                </button>
                <div className="w-20 h-20 bg-[#3b82f6] text-white text-4xl font-bold rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  {hours}
                </div>
                <button
                  onClick={() => setHours(hours + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-blue-500 rounded-lg transition-colors text-xl font-bold border border-gray-100"
                >
                  <FiPlus />
                </button>
              </div>

              <div className="w-full bg-[#f8fafc] rounded-xl p-6 flex flex-col items-center mb-8 border border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Price</span>
                <div className="flex items-start">
                  <span className="text-lg font-bold text-gray-900 mt-1 mr-1">$</span>
                  <span className="text-5xl font-bold text-gray-900">{hours * pricePerHour}</span>
                </div>
                <span className="text-xs font-medium text-gray-400 mt-2">(USD)</span>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue <span>→</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Secure Payment</h2>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-md font-semibold text-sm transition-colors ${
                    paymentMethod === 'card' 
                      ? 'border-blue-400 bg-blue-50/30 text-gray-900' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <BsCreditCard className="text-lg" /> Card
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-md font-semibold text-sm transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'border-blue-400 bg-blue-50/30 text-gray-900' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <BsPaypal className="text-lg" /> PayPal
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 pr-10"
                      />
                      <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 tracking-widest"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 mb-8">
                    <input type="checkbox" id="save-card" className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <label htmlFor="save-card" className="text-xs text-gray-500">Save card for future measurements</label>
                  </div>

                  <button className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Complete Secure Purchase <span>→</span>
                  </button>
                </div>
              ) : (
                <div className="min-h-[200px] flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
                  <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
                    <div className="w-full max-w-[300px]">
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect" }} 
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: (hours * pricePerHour).toString(),
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order.capture();
                          alert("Transaction completed by " + details.payer.name.given_name);
                          handleClose();
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
