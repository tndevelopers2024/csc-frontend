import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaArrowRight, 
  FaRegEyeSlash, 
  FaRegEye, 
  FaTimes, 
  FaEnvelope, 
  FaKey, 
  FaExclamationCircle 
} from 'react-icons/fa';
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

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginBannerSuccess, setLoginBannerSuccess] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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
    setLoginBannerSuccess('');
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

  // Forgot Password Handlers
  const handleOpenForgotPassword = () => {
    setForgotEmail(formData.email || '');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotStep(1);
    setIsForgotModalOpen(true);
  };

  const handleSendResetCode = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');

    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email: forgotEmail.trim()
      });
      setForgotSuccessMsg('A 6-digit verification code has been sent to your email.');
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset code. Please check your email and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotCode || forgotCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setForgotLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        email: forgotEmail.trim(),
        code: forgotCode.trim(),
        newPassword: forgotNewPassword
      });
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFinishReset = () => {
    setIsForgotModalOpen(false);
    setFormData(prev => ({ ...prev, email: forgotEmail, password: '' }));
    setLoginBannerSuccess('Password has been reset successfully! Please log in with your new password.');
    setForgotStep(1);
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row w-full overflow-hidden">
        
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

            {loginBannerSuccess && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-2">
                <FaCheckCircle className="text-green-600 shrink-0" />
                <span>{loginBannerSuccess}</span>
              </div>
            )}

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
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-sm font-semibold text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="w-full text-white bg-[#3b82f6] hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-lg px-5 py-3 text-center flex justify-center items-center transition-colors disabled:bg-blue-400 cursor-pointer">
                {loading ? <span>Logging in...</span> : <span>Log in</span>}
              </button>
              
              {/* Divider */}
              <div className="flex items-center py-2">
                <div className="w-full h-px bg-gray-200"></div>
                <span className="px-4 text-sm text-gray-400 font-medium">or</span>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              {/* Google Button */}
              <button type="button" className="w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-semibold rounded-lg text-base px-5 py-3 text-center flex justify-center items-center space-x-2 transition-colors cursor-pointer">
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

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <FaTimes className="text-lg" />
            </button>

            {/* Step 1: Enter Email */}
            {forgotStep === 1 && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <FaEnvelope className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Forgot Password?</h3>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    Enter the email address registered with your ConvertScanToCAD account. We'll send you a 6-digit verification code and reset link.
                  </p>
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-start gap-2">
                    <FaExclamationCircle className="shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Account Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-sm shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      Cancel and return to log in
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Verification Code & New Password */}
            {forgotStep === 2 && (
              <div>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <FaKey className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Reset Password</h3>
                  <p className="text-gray-600 text-xs mt-1">
                    Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{forgotEmail}</span>
                  </p>
                </div>

                {forgotSuccessMsg && (
                  <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2">
                    <FaCheckCircle className="shrink-0 text-green-600" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-start gap-2">
                    <FaExclamationCircle className="shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      6-Digit Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      required
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-mono tracking-widest text-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                      >
                        {showForgotNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                      >
                        {showForgotConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                      </button>
                    </div>
                  </div>

                  {forgotNewPassword && forgotConfirmPassword && (
                    <div className="text-xs">
                      {forgotNewPassword === forgotConfirmPassword ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <FaCheckCircle className="text-xs" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-sm shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || forgotLoading}
                      onClick={handleSendResetCode}
                      className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline font-semibold cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success */}
            {forgotStep === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={handleFinishReset}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow transition duration-200 cursor-pointer"
                >
                  Continue to Log In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
