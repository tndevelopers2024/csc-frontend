import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FaqItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`border rounded-lg mb-4 overflow-hidden transition-colors shadow-sm ${isOpen ? 'bg-white border-blue-400' : 'bg-[#f0f6ff] border-blue-200 hover:border-blue-300'}`}>
    <button 
      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
      onClick={onClick}
    >
      <span className="font-bold text-sm text-gray-900 pr-4">{question}</span>
      {isOpen ? <FiChevronUp className="text-gray-500 text-lg shrink-0" /> : <FiChevronDown className="text-gray-500 text-lg shrink-0" />}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-sm text-gray-700 leading-relaxed space-y-4">
        {answer}
      </div>
    )}
  </div>
);

export default function Support() {
  const [openFaqs, setOpenFaqs] = useState({ 0: true, 2: true, 3: false, 4: false });

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const faqs = [
    {
      question: "How do I upload a 3D scan file?",
      answer: (
        <>
          <p>In the Upload Scan Files section, Drag and drop your files, click Browse Files to select them from your device, or add a link from your cloud or drive storage.</p>
          <p>You can upload up to 5 files, with a maximum file size of 5 GB per file.</p>
          <p>We support common 3D scan formats including STL, OBJ, PLY, STEP, IGES, PTS, PTX, and XYZ.</p>
        </>
      )
    },
    {
      question: "What file formats are supported?",
      answer: (
        <p>We support a wide variety of formats including STL, OBJ, PLY, and more. For CAD outputs, we typically deliver STEP, IGES, or native SolidWorks files depending on your request.</p>
      )
    },
    {
      question: "How does the free CAD hours work?",
      answer: (
        <>
          <p>New users receive 3 complimentary CAD hours as part of their welcome offer. You can apply these hours to an eligible project and pay only for the remaining billable hours.</p>
          <p>For example, if your project requires 4 CAD hours, you can use your 3 complimentary hours and pay for just 1 hour.</p>
          <p>You're not required to use the free hours on your first project. You can save them and apply them to a future eligible project while they remain valid.</p>
        </>
      )
    },
    {
      question: "How long does a quotation take?",
      answer: (
        <>
          <p>Once you submit your scan files and project requirements, our engineering team reviews the data and prepares a detailed quotation. Most quotations are provided within 3 business hours, depending on the project size and complexity.</p>
          <p>For larger or more complex projects, we may need additional information before providing an accurate estimate.</p>
        </>
      )
    },
    {
      question: "How do I download my finished CAD files?",
      answer: (
        <>
          <p>Once your project is completed, your finished CAD files will be available in your My Project. Open the completed project, review the available deliverables, and click Download to save the files to your device.</p>
          <p>You can access your completed project and files anytime from your dashboard.</p>
        </>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <h1 className="text-3xl font-bold text-[#1e293b] mb-8">Support</h1>

      {/* Search Bar */}
      <div className="relative mb-6 shadow-sm rounded-lg">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-blue-500 text-lg" />
        </div>
        <input 
          type="text" 
          placeholder="Search for help articles, guides, or FAQs..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Track Requests Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Track your requests</h2>
          <p className="text-sm text-gray-500">Check the status of your active support cases.</p>
        </div>
        <button className="bg-white hover:bg-blue-50 text-blue-500 border border-blue-200 font-semibold py-2.5 px-6 rounded-md shadow-sm transition-colors text-sm w-full sm:w-auto">
          View My Tickets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (FAQs) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ</h2>
          <div className="space-y-1">
            {faqs.map((faq, index) => (
              <FaqItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={!!openFaqs[index]}
                onClick={() => toggleFaq(index)}
              />
            ))}
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6 pt-14 lg:pt-12">
          
          {/* Blue Widget */}
          <div className="bg-[#3b82f6] rounded-lg p-8 shadow-sm text-white">
            <h3 className="text-xl font-bold italic mb-4">Precision 24/7</h3>
            <p className="text-sm text-blue-50 leading-relaxed font-medium">
              Our expert metrologists are always reviewing ticket submissions to ensure your conversion is handled with sub-millimeter accuracy.
            </p>
          </div>

          {/* Contact Support Widget */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
              Our support engineers are ready to assist you.
            </p>
            <button className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-colors text-sm">
              Contact<br className="hidden sm:block lg:hidden" /> Support
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
