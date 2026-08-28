import React from 'react';
import { FiBellOff } from 'react-icons/fi';

export default function Notifications() {
  return (
    <div className="max-w-8xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-[#1e293b] mb-6">Notifications</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center text-center mt-2">
        <FiBellOff className="text-5xl text-[#3b82f6] mb-5" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No new notifications</h2>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          We'll notify you when there's an update on your projects or account.
        </p>
      </div>
    </div>
  );
}
