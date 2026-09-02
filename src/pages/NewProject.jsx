import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BsCloudUpload } from 'react-icons/bs';
import { BiChevronRight, BiShieldAlt2 } from 'react-icons/bi';
import { FiArrowRight, FiArrowLeft, FiTrash2, FiFileText, FiLink, FiBox, FiSettings } from 'react-icons/fi';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TbScan } from 'react-icons/tb';
import { FaCheck } from 'react-icons/fa';
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
  const { user } = useOutletContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadMethod, setUploadMethod] = useState('Upload');
  const [links, setLinks] = useState(['']);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
    useFreeHours: '',
    designIntent: false,
    scanToNurbs: false,
    hybridModelling: false,
    asBuildModelling: false,
    software: '',
    version: '',
    cadNeutralFiles: false,
    drafting2D: false
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

  const handleCheckboxChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.checked});
  };

  const handleScanFilesChange = (e) => {
    if (e.target.files) {
      setScanFiles([...scanFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleReferenceImagesChange = (e) => {
    if (e.target.files) {
      setReferenceImages([...referenceImages, ...Array.from(e.target.files)]);
    }
  };

  const removeScanFile = (index) => {
    setScanFiles(scanFiles.filter((_, i) => i !== index));
  };

  const removeReferenceImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleNextStep1 = () => {
    if (uploadMethod === 'Upload' && scanFiles.length === 0) {
      setError('Please upload at least one scan file.');
      return;
    }
    if (uploadMethod === 'Link' && links.filter(l => l.trim() !== '').length === 0) {
      setError('Please provide at least one cloud/drive link.');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!formData.title.trim()) {
      setError('Project title is required.');
      return;
    }
    const hasFreeHours = user?.freeHoursRemaining > 0;
    if (!formData.appType || !formData.accuracy || !formData.partSize || !formData.nda || (hasFreeHours && !formData.useFreeHours)) {
      setError('Please fill in all required Project Details.');
      return;
    }
    setError('');
    setCurrentStep(3);
  };

  const handleNextStep3 = () => {
    if (!formData.designIntent && !formData.hybridModelling && !formData.scanToNurbs && !formData.asBuildModelling) {
      setError('Please select at least one option under Technical Information.');
      return;
    }
    setError('');
    setCurrentStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Project title is required.");
      return;
    }
    if (uploadMethod === 'Upload' && scanFiles.length === 0) {
      setError("Please upload at least one scan file.");
      return;
    }
    if (uploadMethod === 'Link' && links.filter(l => l.trim() !== '').length === 0) {
      setError("Please provide at least one cloud/drive link.");
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

    data.append('uploadMethod', uploadMethod);
    if (uploadMethod === 'Link') {
      links.filter(l => l.trim() !== '').forEach(link => {
        data.append('links', link);
      });
    }

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
        setShowSuccessModal(true);
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
    <div className="max-w-[1400px] mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentStep === 4 ? 'Review & Submit' : 'New Project'}</h1>
        <p className="text-gray-500 text-sm">
          {currentStep === 4 ? 'Please review your project details before final submission. Our engineering team will use this information to provide your quotation.' : 'Upload your scan data and tell us what you need. Our engineering team will review and send you a quotation.'}
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-gray-100 -z-0"></div>
          
          {/* Step 1 */}
          <div className="flex items-center z-10 bg-white pr-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 shadow-[0_0_0_8px_white] ${currentStep >= 1 ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Upload Scan Data</span>
              <span className={`text-xs ${currentStep >= 1 ? 'text-gray-500' : 'text-gray-400'}`}>Add your files</span>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex items-center z-10 bg-white px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 shadow-[0_0_0_8px_white] border ${currentStep >= 2 ? 'bg-[#3b82f6] text-white border-transparent' : 'bg-white border-gray-200 text-gray-400'}`}>2</div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Project Details</span>
              <span className={`text-xs ${currentStep >= 2 ? 'text-gray-500' : 'text-gray-400'}`}>Tell us more</span>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex items-center z-10 bg-white px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 shadow-[0_0_0_8px_white] border ${currentStep >= 3 ? 'bg-[#3b82f6] text-white border-transparent' : 'bg-white border-gray-200 text-gray-400'}`}>3</div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Deliverables</span>
              <span className={`text-xs ${currentStep >= 3 ? 'text-gray-500' : 'text-gray-400'}`}>Set output</span>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="flex items-center z-10 bg-white pl-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 shadow-[0_0_0_8px_white] border ${currentStep >= 4 ? 'bg-[#3b82f6] text-white border-transparent' : 'bg-white border-gray-200 text-gray-400'}`}>4</div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>Review & Submit</span>
              <span className={`text-xs ${currentStep >= 4 ? 'text-gray-500' : 'text-gray-400'}`}>Confirm & send</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Column */}
        <div className="lg:w-[68%] flex flex-col gap-6 relative">
          
          {currentStep === 1 && (
            <>
              {/* Upload Scan Files Box */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Upload Scan Files <span className="text-red-500">*</span></h2>
                  <IoInformationCircleOutline className="text-gray-400 ml-2" />
                </div>
                
                <div className="flex items-center mb-6">
                  <span className="text-sm font-medium text-gray-500 mr-4">Upload method:</span>
                  <div className="flex gap-4">
                    <button 
                      className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${uploadMethod === 'Upload' ? 'bg-[#3b82f6] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setUploadMethod('Upload')}
                    >
                      Upload
                    </button>
                    <button 
                      className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${uploadMethod === 'Link' ? 'bg-[#3b82f6] text-white shadow-sm' : 'bg-white text-[#3b82f6] border border-blue-200 hover:bg-blue-50'}`}
                      onClick={() => setUploadMethod('Link')}
                    >
                      Link
                    </button>
                  </div>
                </div>

                {uploadMethod === 'Upload' ? (
                  <div 
                    className="border-2 border-dashed border-blue-300 bg-white rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/30 transition-colors"
                    onClick={() => scanFilesInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) setScanFiles([...scanFiles, ...Array.from(e.dataTransfer.files)]);
                    }}
                  >
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={scanFilesInputRef} 
                      onChange={handleScanFilesChange} 
                    />
                    <div className="mb-4">
                      <BsCloudUpload className="text-[#3b82f6] text-4xl" />
                    </div>
                    <p className="text-[15px] text-gray-700 font-medium mb-2">Drag & drop your scan files here</p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <button className="px-6 py-2.5 bg-white border border-[#3b82f6] text-[#3b82f6] font-semibold rounded-md hover:bg-blue-50 transition-colors mb-4 text-sm" onClick={(e) => { e.stopPropagation(); scanFilesInputRef.current?.click(); }}>
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-400">Max file size: 5GB</p>
                  </div>
                ) : (
                  <div className="border border-[#3b82f6] rounded-xl p-8 bg-white mb-6">
                    <div className="max-w-2xl mx-auto flex flex-col items-center">
                      {links.map((link, index) => (
                        <div key={index} className={`flex items-center gap-4 mb-4 w-full ${index === 0 ? 'items-end' : ''}`}>
                          <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm shrink-0 ${index === 0 ? 'mb-[2px]' : ''}`}>
                            <BsCloudUpload className="text-[#3b82f6] text-xl" />
                          </div>
                          <div className="flex-1 relative">
                            {index === 0 && <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cloud/Drive Links</label>}
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={link}
                                onChange={(e) => {
                                  const newLinks = [...links];
                                  newLinks[index] = e.target.value;
                                  setLinks(newLinks);
                                }}
                                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm pr-10" 
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (links.length > 1) {
                                    setLinks(links.filter((_, i) => i !== index));
                                  } else {
                                    setLinks(['']);
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 absolute right-2 bottom-1.5"
                                title="Remove link"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setLinks([...links, ''])}
                        className="px-6 py-2 bg-white border border-[#3b82f6] text-[#3b82f6] font-semibold rounded-md hover:bg-blue-50 transition-colors text-sm mt-2"
                      >
                        + Add another link
                      </button>
                    </div>
                  </div>
                )}

                {scanFiles.length > 0 && uploadMethod === 'Upload' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Selected Files:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {scanFiles.map((f, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiFileText className="mr-2" /> {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <button onClick={() => removeScanFile(i)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex items-center flex-wrap gap-2 text-xs font-bold text-gray-400">
                  <span className="mr-3 text-gray-400">SUPPORTED FORMATS:</span>
                  {['STL', 'PLY', 'OBJ', 'PTS', 'PTX', 'XYZ', 'STEP', 'IGES'].map(fmt => (
                    <span key={fmt} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded">{fmt}</span>
                  ))}
                  <span className="text-[#3b82f6] cursor-pointer ml-1 font-semibold">More</span>
                </div>
              </div>

              {/* Upload Bill of materials Box */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Upload Bill of materials and technical data <span className="text-gray-400 font-normal text-[15px] ml-1">(optional)</span></h2>
                </div>
                
                <div 
                  className="border-2 border-dashed border-blue-300 bg-white rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/30 transition-colors"
                  onClick={() => referenceImagesInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) setReferenceImages([...referenceImages, ...Array.from(e.dataTransfer.files)]);
                  }}
                >
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={referenceImagesInputRef} 
                    onChange={handleReferenceImagesChange} 
                  />
                  <div className="mb-4">
                    <BsCloudUpload className="text-[#3b82f6] text-4xl" />
                  </div>
                  <p className="text-[15px] text-gray-700 font-medium mb-2">Drag & drop your scan files here</p>
                  <p className="text-sm text-gray-400 mb-4">or</p>
                  <button className="px-6 py-2.5 bg-white border border-[#3b82f6] text-[#3b82f6] font-semibold rounded-md hover:bg-blue-50 transition-colors mb-6 text-sm" onClick={(e) => { e.stopPropagation(); referenceImagesInputRef.current?.click(); }}>
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mb-8">Max file size: 5GB</p>

                  <div className="flex items-center flex-wrap justify-center gap-2 text-xs font-bold text-gray-400">
                    <span className="mr-3 text-gray-400">SUPPORTED FORMATS:</span>
                    {['.xls', '.xlsx', '.docx', '.ppt', '.pptx', '.pdf', '.jpeg', '.jpg', '.png', '.tif', '.mp'].map(fmt => (
                      <span key={fmt} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded">{fmt}</span>
                    ))}
                  </div>
                </div>

                {referenceImages.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Selected References:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {referenceImages.map((f, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiFileText className="mr-2" /> {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <button onClick={() => removeReferenceImage(i)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Action Area */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mt-4 mb-2 text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <div className="flex justify-end mt-2 mb-8">
                <button 
                  onClick={handleNextStep1} 
                  className={`bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg px-8 py-3.5 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] flex items-center space-x-2 transition-all`}
                >
                  <span>Save & Continue</span>
                  <FiArrowRight className="ml-1" />
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Project Details <span className="text-red-500">*</span></h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Project Title"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Application type</label>
                    <CustomDropdown 
                      options={['Manufacturing', '3D Printing', 'Study & Analysis', 'Reverse Engineering', 'Quality Inspection']}
                      placeholder="Select Application"
                      value={formData.appType}
                      onChange={(val) => setFormData({...formData, appType: val})}
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      Accuracy required
                      <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                    </label>
                    <CustomDropdown 
                      options={['High (±0.1mm)', 'Medium (0.3mm)', 'Low (0.5mm)']}
                      placeholder="Select Accuracy"
                      value={formData.accuracy}
                      onChange={(val) => setFormData({...formData, accuracy: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Part size</label>
                    <CustomDropdown 
                      options={['Medium (100–500mm)', 'Small (<100mm)', 'Large (>500mm)']}
                      placeholder="Select Part size"
                      value={formData.partSize}
                      onChange={(val) => setFormData({...formData, partSize: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NDA required</label>
                    <CustomDropdown 
                      options={['Yes — please send NDA', 'No']}
                      placeholder="Select if NDA required"
                      value={formData.nda}
                      onChange={(val) => setFormData({...formData, nda: val})}
                    />
                  </div>
                  {user?.freeHoursRemaining > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Use free 3 hours</label>
                      <CustomDropdown 
                        options={['Yes — apply free hours', 'No — save for later']}
                        placeholder="Select to use free 3 hours"
                        value={formData.useFreeHours}
                        onChange={(val) => setFormData({...formData, useFreeHours: val})}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mt-6 text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => setCurrentStep(1)} 
                  className="bg-white border border-blue-300 text-[#3b82f6] font-semibold rounded-lg px-6 py-3 hover:bg-blue-50 transition-colors flex items-center shadow-sm"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Scan Data
                </button>
                
                <button 
                  onClick={handleNextStep2} 
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg px-8 py-3 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all flex items-center"
                >
                  Save & Continue
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Deliverables <span className="text-red-500">*</span></h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Technical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="designIntent"
                      checked={formData.designIntent}
                      onChange={handleCheckboxChange}
                      className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    Design Intent
                    <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                  </label>
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hybridModelling"
                      checked={formData.hybridModelling}
                      onChange={handleCheckboxChange}
                      className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    Hybrid Modelling
                    <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                  </label>
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="scanToNurbs"
                      checked={formData.scanToNurbs}
                      onChange={handleCheckboxChange}
                      className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    Scan to NURBS
                    <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                  </label>
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="asBuildModelling"
                      checked={formData.asBuildModelling}
                      onChange={handleCheckboxChange}
                      className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    As-Build Modelling
                    <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                  </label>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Live.transfer format (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Software (Optional)</label>
                    <div className={!formData.designIntent ? 'opacity-50 pointer-events-none' : ''}>
                      <CustomDropdown 
                        options={['Solidworks: .sldprt', 'Creo: .prt', 'Inventor: .iam, ipt', 'Siemens NX: .prt']}
                        placeholder="Select Software"
                        value={formData.software}
                        onChange={(val) => setFormData({...formData, software: val})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Version (Optional)</label>
                    <div className={!formData.designIntent ? 'opacity-50 pointer-events-none' : ''}>
                      <CustomDropdown 
                        options={['2024', '2023', '2022', '2021', '2020']}
                        placeholder="Select Version"
                        value={formData.version}
                        onChange={(val) => setFormData({...formData, version: val})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <label className={`flex items-center text-sm font-medium text-gray-700 cursor-pointer ${(formData.hybridModelling || formData.scanToNurbs || formData.asBuildModelling) ? '' : 'opacity-50 pointer-events-none'}`}>
                  <input 
                    type="checkbox" 
                    name="cadNeutralFiles"
                    checked={formData.cadNeutralFiles}
                    onChange={handleCheckboxChange}
                    disabled={!(formData.hybridModelling || formData.scanToNurbs || formData.asBuildModelling)}
                    className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  CAD neutral files
                  <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                </label>
                <label className={`flex items-center text-sm font-medium text-gray-700 cursor-pointer ${formData.designIntent ? '' : 'opacity-50 pointer-events-none'}`}>
                  <input 
                    type="checkbox" 
                    name="drafting2D"
                    checked={formData.drafting2D}
                    onChange={handleCheckboxChange}
                    disabled={!formData.designIntent}
                    className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  2D Drafting (.dwg)
                  <IoInformationCircleOutline className="text-gray-400 ml-1.5" />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mt-6 text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => setCurrentStep(2)} 
                  className="bg-white border border-blue-300 text-[#3b82f6] font-semibold rounded-lg px-6 py-3 hover:bg-blue-50 transition-colors flex items-center shadow-sm"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Project Details
                </button>
                
                <button 
                  onClick={handleNextStep3} 
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg px-8 py-3 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all flex items-center"
                >
                  Save & Continue
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <>
              {/* Scan Data Box */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center text-gray-900 font-bold">
                    <BsCloudUpload className="text-gray-500 mr-2 text-lg" />
                    Scan Data
                  </div>
                  <button onClick={() => setCurrentStep(1)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">Change</button>
                </div>
                <div className="p-6">
                  {uploadMethod === 'Upload' && scanFiles.length === 0 && referenceImages.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No files selected.</div>
                  ) : (
                    <div className="space-y-4">
                      {uploadMethod === 'Link' && links.filter(l => l.trim() !== '').map((l, i) => (
                        <div key={'link'+i} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center w-full">
                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center mr-4 shrink-0">
                              <FiLink className="text-gray-400 text-xl" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-gray-900 truncate pr-4">{l}</div>
                              <div className="text-xs text-gray-500">Cloud/Drive Link</div>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <FaCheck className="text-blue-500 text-[10px]" />
                          </div>
                        </div>
                      ))}
                      {scanFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center mr-4">
                              <FiFileText className="text-gray-400 text-xl" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{f.name}</div>
                              <div className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(1)} MB • Scan File</div>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                            <FaCheck className="text-blue-500 text-[10px]" />
                          </div>
                        </div>
                      ))}
                      {referenceImages.map((f, i) => (
                        <div key={'ref'+i} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center mr-4">
                              <FiFileText className="text-gray-400 text-xl" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{f.name}</div>
                              <div className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(1)} MB • Reference File</div>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                            <FaCheck className="text-blue-500 text-[10px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Deliverables Box */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center text-gray-900 font-bold">
                    <FiBox className="text-gray-500 mr-2 text-lg" />
                    Selected Deliverables
                  </div>
                  <button onClick={() => setCurrentStep(3)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">Modify</button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Technical Information</div>
                      <div className="text-sm font-bold text-gray-900 space-y-1">
                        {formData.designIntent && <div>Design Intent</div>}
                        {formData.hybridModelling && <div>Hybrid Modelling</div>}
                        {formData.scanToNurbs && <div>Scan to NURBS</div>}
                        {formData.asBuildModelling && <div>As-Build Modelling</div>}
                        {!(formData.designIntent || formData.hybridModelling || formData.scanToNurbs || formData.asBuildModelling) && <div className="text-gray-500 italic font-normal">None selected</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Live.transfer format</div>
                      <div className="text-sm font-bold text-gray-900 space-y-1">
                        {formData.cadNeutralFiles && <div>CAD Neutral Files</div>}
                        {formData.drafting2D && <div>2D Drafting (.dwg)</div>}
                        {!(formData.cadNeutralFiles || formData.drafting2D) && <div className="text-gray-500 italic font-normal">None selected</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Software</div>
                      <div className="text-sm font-bold text-gray-900">{formData.software || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Version</div>
                      <div className="text-sm font-bold text-gray-900">{formData.version || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar Widgets */}
        <div className="lg:w-[32%] flex flex-col gap-6">

          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center text-gray-900 font-bold">
                  <span className="text-gray-500 mr-2 text-lg">⚙️</span>
                  Project Details
                </div>
                <button onClick={() => setCurrentStep(2)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">Edit</button>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Project Name</div>
                    <div className="text-sm font-bold text-gray-900">{formData.title || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Project Description</div>
                    <div className="text-sm font-bold text-gray-900">{formData.description || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Application Type</div>
                      <div className="text-sm font-bold text-gray-900">{formData.appType || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Accuracy</div>
                      <div className="text-sm font-bold text-gray-900">{formData.accuracy || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Part Size</div>
                      <div className="text-sm font-bold text-gray-900">{formData.partSize || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">NDA</div>
                      <div className="text-sm font-bold text-gray-900">{formData.nda || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">CAD Free Hours</div>
                    <div className="text-sm font-bold text-gray-900">{formData.useFreeHours || <span className="text-gray-500 italic font-normal">Not specified</span>}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep !== 4 && (
            <>
              {/* Partners Box */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <TbScan className="text-[#3b82f6] text-2xl mr-3" />
              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                We Support All Major<br />Scan Sources
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-y-8 gap-x-4 items-center">
              <img src="/images/user-dashboard/company1.png" alt="Shining 3D" className="h-4 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">Shining 3D</div>

              <img src="/images/user-dashboard/company2.png" alt="FARO" className="h-5 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">FARO</div>

              <img src="/images/user-dashboard/company3.png" alt="Creaform" className="h-4 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">Creaform</div>

              <img src="/images/user-dashboard/company4.png" alt="Artec 3D" className="h-5 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">Artec 3D</div>

              <img src="/images/user-dashboard/company5.png" alt="Scantech" className="h-4 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">Scantech</div>

              <img src="/images/user-dashboard/company6.png" alt="Revopoint" className="h-4 object-contain mx-auto transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase">Revopoint</div>

              <img src="/images/user-dashboard/company7.png" alt="Hexagon" className="h-5 object-contain mx-auto col-span-2 transition-all opacity-80" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <div className="hidden text-[10px] font-bold text-gray-400 text-center uppercase col-span-2">Hexagon</div>

              <div className="text-xs font-bold text-[#3b82f6] text-center flex flex-col items-center justify-center">
                <span>&</span>
                <span>Many</span>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Security Box */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <BiShieldAlt2 className="text-[#3b82f6] text-3xl mr-3" />
              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Secure &<br />Confidential</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your data is protected with enterprise-grade security. We never share your files.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-gray-700">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                <span>Encrypted file transfer</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                <span>Secure engineering network</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <FaCheck className="text-green-500 mt-0.5 mr-3 shrink-0" />
                <span>NDA available on request</span>
              </li>
            </ul>
          </div>
            </>
          )}
        </div>
      </div>

      {currentStep === 4 && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="bg-[#e6f0fd] p-4 rounded-xl flex items-start">
            <IoInformationCircleOutline className="text-blue-500 text-xl mr-3 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              By submitting this project, you agree that the provided data is accurate. Our engineers will review the file integrity and technical requirements before generating the final quote. You will receive a notification within 4 working hours.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mt-2 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}
          <div className="flex justify-between items-center mt-4 mb-8">
            <button 
              onClick={() => setCurrentStep(3)} 
              className="bg-white border border-blue-300 text-[#3b82f6] font-semibold rounded-lg px-6 py-3 hover:bg-blue-50 transition-colors flex items-center shadow-sm"
            >
              <FiArrowLeft className="mr-2" />
              Back to Deliverables
            </button>
            
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg px-10 py-3 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
              {!isSubmitting && <FiArrowRight className="ml-2" />}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative mt-10">
            {/* Top blue bar */}
            <div className="absolute top-0 left-0 w-full h-[6px] bg-[#1e73e8]"></div>
            
            <div className="px-12 py-10 flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-[#e6f0fd] rounded-[1.25rem] flex items-center justify-center mb-6 mt-4">
                <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center">
                  <FaCheck className="text-white text-md" />
                </div>
              </div>
              
              {/* Title & Subtitle */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Submitted Successfully!</h2>
              <p className="text-gray-500 text-center text-sm max-w-sm mb-6">
                Your technical data has been securely uploaded to our metrology processing cluster.
              </p>
              
              {/* What Happens Next Section */}
              <div className="w-full text-left mt-4 border-t border-gray-100 pt-6">
                <h3 className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-widest mb-6">What Happens Next</h3>
                
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-6 left-[1.125rem] w-px bg-gray-200 z-0"></div>
                  
                  {/* Step 1 */}
                  <div className="relative z-10 flex items-start gap-5 mb-8">
                    <div className="w-9 h-9 rounded bg-[#e6f0fd] text-[#1e73e8] font-bold flex shrink-0 items-center justify-center outline outline-8 outline-white">1</div>
                    <div className="pt-1.5">
                      <h4 className="font-bold text-gray-900 mb-1">Technical Review</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Our senior engineers will analyze your scan data for density, alignment, and geometric integrity.</p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative z-10 flex items-start gap-5 mb-8">
                    <div className="w-9 h-9 rounded bg-[#e6f0fd] text-[#1e73e8] font-bold flex shrink-0 items-center justify-center outline outline-8 outline-white">2</div>
                    <div className="pt-1.5">
                      <h4 className="font-bold text-gray-900 mb-1">Quotation</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">You'll receive a detailed technical quote and lead-time estimate within 3 business hours.</p>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="w-9 h-9 rounded bg-[#e6f0fd] text-[#1e73e8] font-bold flex shrink-0 items-center justify-center outline outline-8 outline-white">3</div>
                    <div className="pt-1.5">
                      <h4 className="font-bold text-gray-900 mb-1">Project Start</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Review and approve the quote in your CAD Wallet to initiate the reverse engineering process.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex w-full gap-4 mt-12">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex-1 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  Back to Dashboard
                  <FiArrowRight className="ml-2" />
                </button>
                <button 
                  onClick={() => navigate('/dashboard/projects')} 
                  className="flex-1 bg-white border border-[#3b82f6] text-[#3b82f6] hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  View Project Details
                </button>
              </div>
              
              {/* Footer text */}
              <div className="flex items-center text-[10px] font-bold text-gray-400 mt-8 tracking-widest uppercase">
                <BiShieldAlt2 className="mr-1.5 text-lg" />
                END-TO-END ENCRYPTED DATA PROCESSING
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

