import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaGift, FaArrowRight, FaRegEyeSlash, FaRegEye } from 'react-icons/fa';
import { BiShieldAlt2, BiTimeFive, BiGlobe } from 'react-icons/bi';
import { BsCloudUpload } from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';

const countriesData = getCountries().map(c => ({
  name: en[c],
  code: `+${getCountryCallingCode(c)}`,
  flag: `https://flagcdn.com/${c.toLowerCase()}.svg`,
  cca2: c
})).sort((a, b) => a.name.localeCompare(b.name));

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobilePrefix: '+91',
    mobile: '',
    country: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [selectedCountryFlag, setSelectedCountryFlag] = useState('https://flagcdn.com/in.svg');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPrefixDropdownOpen, setIsPrefixDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!formData.agreeTerms) {
      return setError("You must agree to the Terms of Service");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries is still used for the Country dropdown below
  // We no longer need selectedCountryCodeData logic here

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row w-full max-w-7xl overflow-hidden min-h-[850px]">
        
        {/* Left Side - Promo Panel */}
        <div className="bg-[#0b1f47] text-white p-10 lg:w-1/2 flex flex-col justify-between m-2 rounded-2xl">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Start Converting<br />
              Scan Data Into CAD-<br />
              <span className="text-[#3b82f6]">Free</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 font-medium max-w-md">
              Create your account and receive 3 free CAD hours to test the world's first Scan-to-CAD cloud platform.
            </p>
            
            {/* Promo Badge */}
            <div className="inline-flex items-center bg-[#152e66] border border-[#2a458a] rounded-md overflow-hidden mb-12 shadow-inner">
              <div className="flex items-center px-4 py-2 bg-[#1a367a] text-[#fcd34d] font-semibold space-x-2">
                <FaGift className="text-xl" />
                <span>3 Free CAD Hours Included</span>
              </div>
              <div className="px-4 py-2 text-sm font-bold tracking-wider text-gray-300">
                NO CREDIT CARD REQUIRED
              </div>
            </div>

            {/* Images Process Section */}
            <div className="bg-[#10295c] p-6 rounded-xl border border-[#1e3b7a] mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col items-center">
                  <img src="/images/login/login1.png" alt="Point Cloud" className="h-20 object-contain mb-2" />
                  <span className="text-[10px] font-bold tracking-wider text-gray-400">POINT CLOUD</span>
                </div>
                <FaArrowRight className="text-blue-500 text-sm" />
                <div className="flex flex-col items-center">
                  <img src="/images/login/login2.png" alt="Mesh" className="h-20 object-contain mb-2" />
                  <span className="text-[10px] font-bold tracking-wider text-gray-400">MESH</span>
                </div>
                <FaArrowRight className="text-blue-500 text-sm" />
                <div className="flex flex-col items-center">
                  <img src="/images/login/login3.png" alt="Parametric CAD" className="h-20 object-contain mb-2" />
                  <span className="text-[10px] font-bold tracking-wider text-gray-400">PARAMETRIC CAD</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2 mb-10 text-sm font-medium">
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Upload STL, OBJ, PLY & Point Clouds</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Global Engineering Production Capacity</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Parametric CAD, NURBS & Hybrid Models</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Fast Turnaround Transparent Pricing</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Secure Project Management</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                <span>Bank-Level Data Security</span>
              </div>
            </div>
          </div>

          {/* Footer Features */}
          <div className="bg-[#0f2452] border border-[#1e3b7a] rounded-xl p-4 flex justify-between items-start text-center">
            <div className="flex flex-col items-center w-1/4 px-2">
              <BiShieldAlt2 className="text-blue-400 text-2xl mb-2" />
              <span className="text-[10px] font-bold">Secure & Private</span>
              <span className="text-[8px] text-gray-400 mt-1">Your data is safe with us</span>
            </div>
            <div className="flex flex-col items-center w-1/4 px-2">
              <BsCloudUpload className="text-blue-400 text-2xl mb-2" />
              <span className="text-[10px] font-bold">Supports Large Files</span>
              <span className="text-[8px] text-gray-400 mt-1">Upload up to 5GB per file</span>
            </div>
            <div className="flex flex-col items-center w-1/4 px-2">
              <BiTimeFive className="text-blue-400 text-2xl mb-2" />
              <span className="text-[10px] font-bold">Fast & Reliable</span>
              <span className="text-[8px] text-gray-400 mt-1">Quick turnaround time</span>
            </div>
            <div className="flex flex-col items-center w-1/4 px-2">
              <BiGlobe className="text-blue-400 text-2xl mb-2" />
              <span className="text-[10px] font-bold">Global Support</span>
              <span className="text-[8px] text-gray-400 mt-1">We're here to help 24/7</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white p-10 lg:p-14 lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Free Account</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Get Started with 3 complimentary CAD hours.<br />No credit card required.
          </p>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-full relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-600">First Name <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First Name" className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="w-full relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-600">Last Name <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last Name" className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-blue-600">Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" className="w-full border-2 border-blue-500 rounded-md px-4 py-3 text-gray-800 focus:outline-none" />
            </div>

            {/* Mobile Number Field */}
            <div className="flex gap-3">
              <div className="relative w-1/3">
                <div 
                  className="w-full border border-gray-300 rounded-md px-3 py-3 flex items-center justify-between bg-white text-gray-700 cursor-pointer overflow-hidden relative h-full"
                  onClick={() => setIsPrefixDropdownOpen(!isPrefixDropdownOpen)}
                >
                  <div className="flex items-center space-x-2 w-full h-full">
                    {selectedCountryFlag && <img src={selectedCountryFlag} alt="flag" className="w-5 object-contain" />}
                    <span className="text-sm font-medium">{formData.mobilePrefix}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>

                {isPrefixDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPrefixDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {countriesData.map((c, i) => (
                        <div 
                          key={i}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, mobilePrefix: c.code }));
                            setSelectedCountryFlag(c.flag);
                            setIsPrefixDropdownOpen(false);
                          }}
                        >
                          <img src={c.flag} alt="flag" className="w-5 object-contain" />
                          <span className="text-sm text-gray-700">{c.name} ({c.code})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="relative w-2/3">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-600 z-10">Mobile Number <span className="text-red-500">*</span></label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="94xxx xxxxx" className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent relative z-0 bg-transparent" />
              </div>
            </div>

            {/* Country Select */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-600">Country <span className="text-red-500">*</span></label>
              <select name="country" value={formData.country} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select country</option>
                {countriesData.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Role Select */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-600">I am <span className="text-red-500">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select Your Role</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Freelancer">Freelancer</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Password Fields */}
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showPassword ? (
                  <FaRegEye className="text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                ) : (
                  <FaRegEyeSlash className="text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm Password" className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showConfirmPassword ? (
                  <FaRegEye className="text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
                ) : (
                  <FaRegEyeSlash className="text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
                )}
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input id="terms" type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 cursor-pointer" />
              </div>
              <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-500 cursor-pointer">
                I agree to <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full text-white bg-[#3b82f6] hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-lg px-5 py-4 text-center flex justify-center items-center space-x-2 transition-colors mt-2 disabled:bg-blue-400">
              {loading ? <span>Loading...</span> : (
                <>
                  <FaGift className="text-xl" />
                  <span>Create Account & Get 3 Free CAD Hours</span>
                </>
              )}
            </button>
            
            {/* Divider */}
            <div className="flex items-center py-4">
              <div className="w-full h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-400 font-medium">or</span>
              <div className="w-full h-px bg-gray-200"></div>
            </div>

            {/* Google Button */}
            <button type="button" className="w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-semibold rounded-lg text-base px-5 py-3 text-center flex justify-center items-center space-x-2 transition-colors">
              <span>Continue with Google</span>
              <FcGoogle className="text-xl" />
            </button>

            {/* Login Link */}
            <div className="text-center mt-6 text-sm font-medium text-gray-500">
              Already have an account?? <Link to="/login" className="text-blue-600 hover:underline font-bold">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
