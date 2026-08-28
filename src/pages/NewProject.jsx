import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCloudUpload } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa';
import { BiChevronRight, BiShieldAlt2 } from 'react-icons/bi';
import { FiArrowRight } from 'react-icons/fi';
import { IoInformationCircleOutline } from 'react-icons/io5';

const CustomDropdown = ({ options, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`w-full border px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center bg-white ${isOpen ? 'border-blue-400 rounded-t-md border-b-blue-100' : 'border-gray-300 rounded-md'} ${!value ? 'text-gray-600' : 'text-gray-800'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <BiChevronRight className={`text-xl transition-transform text-gray-500 ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full border border-t-0 border-blue-400 rounded-b-md shadow-lg overflow-hidden bg-white top-[100%] max-h-60 overflow-y-auto">
          {options.map((option, idx) => (
            <div 
              key={idx}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#e6f0fd] text-gray-800 ${value === option ? 'bg-[#e6f0fd]' : 'bg-white'}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appType: '',
    industry: '',
    cadOutput: '',
    accuracy: '',
    partSize: '',
    turnaround: '',
    nda: '',
    useFreeHours: ''
  });

  const [scanFiles, setScanFiles] = useState([]);
  const [referenceImages, setReferenceImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const scanFilesInputRef = useRef(null);
  const referenceImagesInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleScanFilesChange = (e) => {
    if (e.target.files) {
      setScanFiles(Array.from(e.target.files));
    }
  };

  const handleReferenceImagesChange = (e) => {
    if (e.target.files) {
      setReferenceImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Project title is required.");
      window.scrollTo(0, 0);
      return;
    }
    if (scanFiles.length === 0) {
      setError("Please upload at least one scan file.");
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError("You must be logged in to create a project.");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    scanFiles.forEach(file => {
      data.append('scanFiles', file);
    });

    referenceImages.forEach(file => {
      data.append('referenceImages', file);
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to projects list or show success
        navigate('/dashboard/projects');
      } else {
        setError(result.message || 'Failed to submit project');
      }
    } catch (err) {
      setError('An error occurred while submitting the project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto pb-24">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Project</h1>
        <p className="text-gray-500 text-sm">
          Upload your scan data and tell us what you need. Our engineering team will review and send you a quotation.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Column */}
        <div className="lg:w-2/3 flex flex-col gap-6 relative">
          
          {/* Stepper */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-2">
            <div className="flex items-center justify-between max-w-lg mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 border-t border-dashed border-gray-400 -z-0"></div>
              
              <div className="flex flex-col items-center z-10 bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm mb-2">1</div>
                <span className="text-xs font-bold text-gray-800">Upload Data</span>
              </div>
              
              <div className="flex flex-col items-center z-10 bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-sm mb-2">2</div>
                <span className="text-xs font-bold text-gray-800">Review & Submit</span>
              </div>
              
              <div className="flex flex-col items-center z-10 bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-sm mb-2">3</div>
                <span className="text-xs font-bold text-gray-800">Get Quote in 15 Mintes</span>
              </div>
            </div>
          </div>

          {/* Upload Scan Files Box */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upload Scan Files <span className="text-red-500">*</span></h2>
              <IoInformationCircleOutline className="text-gray-400 ml-2" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Drag Drop Zone */}
              <div 
                className="flex-1 border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/60 transition-colors"
                onClick={() => scanFilesInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) setScanFiles(Array.from(e.dataTransfer.files));
                }}
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={scanFilesInputRef} 
                  onChange={handleScanFilesChange} 
                />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <BsCloudUpload className="text-blue-500 text-xl" />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">Drag & drop your scan files here</p>
                <p className="text-xs text-gray-400 mb-4">or</p>
                <button className="px-6 py-2 bg-white border border-blue-500 text-blue-500 font-semibold rounded-md hover:bg-blue-50 transition-colors mb-4 text-sm" onClick={(e) => { e.stopPropagation(); scanFilesInputRef.current?.click(); }}>
                  Browse Files
                </button>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Max file size: 5GB</p>
                  <p>You can upload up to 5 files</p>
                </div>
              </div>

              {/* Tips */}
              <div className="md:w-64 shrink-0">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-yellow-500 mr-2">💡</span> Tips for better results
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start text-xs text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 mr-2 shrink-0" />
                    Use high quality scan data for best accuracy
                  </li>
                  <li className="flex items-start text-xs text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 mr-2 shrink-0" />
                    Remove unnecessary background data
                  </li>
                  <li className="flex items-start text-xs text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 mr-2 shrink-0" />
                    Include reference dimensions if available
                  </li>
                  <li className="flex items-start text-xs text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 mr-2 shrink-0" />
                    Specify important features and tolerances
                  </li>
                  <li className="flex items-start text-xs text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 mr-2 shrink-0" />
                    Share any sketches or drawing if available
                  </li>
                </ul>
              </div>
            </div>

            {scanFiles.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Selected Scan Files:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {scanFiles.map((f, i) => (
                    <li key={i}>📄 {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex items-center flex-wrap gap-2 text-xs font-bold text-gray-400">
              <span className="mr-2">SUPPORTED FORMATS:</span>
              {['STL', 'PTS', 'OBJ', 'PTX', 'PLY', 'XYZ', 'STEP', 'IGES'].map(fmt => (
                <span key={fmt} className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{fmt}</span>
              ))}
              <span className="text-blue-500 cursor-pointer">More</span>
            </div>
          </div>

          {/* Project Details Box */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Project Details <span className="text-red-500">*</span></h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Application type</label>
                  <CustomDropdown 
                    options={['Manufacturing', '3D Printing', 'Study & Analysis', 'Reverse Engineering', 'Quality Inspection']}
                    placeholder="Select Application"
                    value={formData.appType}
                    onChange={(val) => setFormData({...formData, appType: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Industry</label>
                  <CustomDropdown 
                    options={['Industrial / Pump', 'Automotive', 'Aerospace']}
                    placeholder="Select Industry"
                    value={formData.industry}
                    onChange={(val) => setFormData({...formData, industry: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Required CAD output</label>
                  <CustomDropdown 
                    options={['STEP (.stp)', 'IGES (.igs)', 'SolidWorks (.sldprt)']}
                    placeholder="Select Output Format"
                    value={formData.cadOutput}
                    onChange={(val) => setFormData({...formData, cadOutput: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Accuracy required</label>
                  <CustomDropdown 
                    options={['High (±0.1mm)', 'Medium (0.3mm)', 'Low (0.5mm)']}
                    placeholder="Select Accuracy"
                    value={formData.accuracy}
                    onChange={(val) => setFormData({...formData, accuracy: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Part size</label>
                  <CustomDropdown 
                    options={['Medium (100–500mm)', 'Small (<100mm)', 'Large (>500mm)']}
                    placeholder="Select Size"
                    value={formData.partSize}
                    onChange={(val) => setFormData({...formData, partSize: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Turnaround</label>
                  <CustomDropdown 
                    options={['Urgent (24 hrs)', 'Standard (3-5 days)', 'Flexible']}
                    placeholder="Select Turnaround"
                    value={formData.turnaround}
                    onChange={(val) => setFormData({...formData, turnaround: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">NDA required</label>
                  <CustomDropdown 
                    options={['Yes — please send NDA', 'No']}
                    placeholder="Select Option"
                    value={formData.nda}
                    onChange={(val) => setFormData({...formData, nda: val})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Use free 4 hours</label>
                  <CustomDropdown 
                    options={['Yes — apply free hours', 'No — save for later']}
                    placeholder="Select Option"
                    value={formData.useFreeHours}
                    onChange={(val) => setFormData({...formData, useFreeHours: val})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Reference Images Box */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upload Reference Images <span className="text-gray-400 font-normal text-sm ml-1">(optional)</span></h2>
              <IoInformationCircleOutline className="text-gray-400 ml-2" />
            </div>
            
            <div 
              className="border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/60 transition-colors"
              onClick={() => referenceImagesInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) setReferenceImages(Array.from(e.dataTransfer.files));
              }}
            >
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={referenceImagesInputRef} 
                onChange={handleReferenceImagesChange} 
              />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <BsCloudUpload className="text-blue-500 text-xl" />
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">Drag & drop your reference images here</p>
              <p className="text-xs text-gray-400 mb-4">or</p>
              <button className="px-6 py-2 bg-white border border-blue-500 text-blue-500 font-semibold rounded-md hover:bg-blue-50 transition-colors mb-4 text-sm" onClick={(e) => { e.stopPropagation(); referenceImagesInputRef.current?.click(); }}>
                Browse Files
              </button>
              <div className="text-xs text-gray-400 space-y-1 mb-6">
                <p>Max file size: 5GB</p>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-gray-400">
                <span className="mr-2">SUPPORTED FORMATS:</span>
                {['JPG', 'PNG', 'PDF', 'DWG'].map(fmt => (
                  <span key={fmt} className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{fmt}</span>
                ))}
              </div>
            </div>

            {referenceImages.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Selected Reference Images:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {referenceImages.map((f, i) => (
                    <li key={i}>🖼️ {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Action Area */}
          <div className="flex justify-end mt-2">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={`bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-lg px-8 py-3.5 shadow-lg flex items-center space-x-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? 'Uploading...' : 'Save & Continue'}</span>
              {!isSubmitting && <FiArrowRight />}
            </button>
          </div>

        </div>

        {/* Right Sidebar Widgets */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          
          {/* Partners Box */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <BsCloudUpload className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              We Support All Major<br />Scan Sources
            </h3>
            <div className="grid grid-cols-3 gap-6 items-center px-4">
              <img src="/images/user-dashboard/company1.png" alt="Partner 1" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company2.png" alt="Partner 2" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company3.png" alt="Partner 3" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company4.png" alt="Partner 4" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company5.png" alt="Partner 5" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company6.png" alt="Partner 6" className="h-6 object-contain mx-auto" />
              <img src="/images/user-dashboard/company7.png" alt="Partner 6" className="h-6 object-contain mx-auto" />
            </div>
          </div>

          {/* Security Box */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex mb-4">
               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <BiShieldAlt2 className="text-blue-500" />
               </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Secure & Confidential</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your data is protected with enterprise-grade security. We never share your files.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-gray-700 font-medium">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                Encrypted file transfer
              </li>
              <li className="flex items-start text-sm text-gray-700 font-medium">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                Secure engineering network
              </li>
              <li className="flex items-start text-sm text-gray-700 font-medium">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                NDA available on request
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
