import React, { useState } from 'react';
import { FaCheckCircle, FaArrowRight, FaRegEyeSlash, FaRegEye } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      // Store token
      localStorage.setItem('token', res.data.token);
      
      // Redirect based on role
      if (res.data.user && res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row w-full max-w-7xl overflow-hidden min-h-[850px]">
        
        {/* Left Side - Promo Panel */}
        <div className="bg-[#0b1f47] text-white p-10 lg:w-1/2 flex flex-col justify-start m-2 rounded-2xl">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Welcome Back to<br />
              ConvertScanToCAD
            </h1>
            <p className="text-lg text-gray-200 mb-8 font-medium max-w-md">
              Pick up right where you left off — your projects, quotations and CAD hours are waiting.
            </p>
            
            {/* Promo Badge */}
            <div className="inline-flex items-center bg-[#152e66] border border-[#2a458a] rounded-md overflow-hidden mb-12 shadow-inner">
              <div className="px-4 py-3 text-[#fcd34d] font-semibold">
                Trusted by engineering teams worldwide
              </div>
              <div className="h-6 w-px bg-[#2a458a]"></div>
              <div className="px-4 py-3 text-sm font-bold tracking-wider text-white">
                24/7 GLOBAL SUPPORT
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-2 mb-12 text-sm font-medium">
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Upload STL, OBJ, PLY & Point Clouds</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Global Engineering Production Capacity</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Parametric CAD, NURBS & Hybrid Models</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Fast Turnaround Transparent Pricing</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Secure Project Management</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0 text-lg" />
                <span>Bank-Level Data Security</span>
              </div>
            </div>
          </div>

          {/* Images Process Section */}
          <div className="bg-[#10295c] p-6 rounded-xl border border-[#1e3b7a] mt-auto">
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
        </div>

        {/* Right Side - Form */}
        <div className="bg-white p-10 lg:p-14 lg:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center">Log in</h2>
            <p className="text-gray-600 mb-6 font-medium text-center">
              Please login to continue to your account.
            </p>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-blue-600">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" className="w-full border-2 border-blue-500 rounded-md px-4 py-3 text-gray-800 focus:outline-none" />
              </div>

              {/* Password Field */}
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

              {/* Keep me logged in and Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input id="keep-logged-in" type="checkbox" name="keepLoggedIn" checked={formData.keepLoggedIn} onChange={handleChange} className="w-4 h-4 border-2 border-gray-400 rounded-sm bg-white focus:ring-3 focus:ring-blue-300 cursor-pointer" />
                  <label htmlFor="keep-logged-in" className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    Keep me logged in
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-blue-500 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="w-full text-white bg-[#3b82f6] hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-lg px-5 py-3 text-center flex justify-center items-center transition-colors disabled:bg-blue-400">
                {loading ? <span>Logging in...</span> : <span>Log in</span>}
              </button>
              
              {/* Divider */}
              <div className="flex items-center py-2">
                <div className="w-full h-px bg-gray-200"></div>
                <span className="px-4 text-sm text-gray-400 font-medium">or</span>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              {/* Google Button */}
              <button type="button" className="w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-semibold rounded-lg text-base px-5 py-3 text-center flex justify-center items-center space-x-2 transition-colors">
                <span>Log in with Google</span>
                <FcGoogle className="text-xl" />
              </button>

              {/* Signup Link */}
              <div className="text-center mt-6 text-sm font-medium text-gray-600">
                Need an account? <Link to="/signup" className="text-blue-500 hover:underline font-bold">Create one</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
