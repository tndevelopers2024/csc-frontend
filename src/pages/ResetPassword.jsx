import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaRegEye, 
  FaRegEyeSlash, 
  FaArrowLeft,
  FaShieldAlt,
  FaKey
} from 'react-icons/fa';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (!tokenParam && (!email || !code)) {
      setError('Please provide your email address and 6-digit reset code.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        newPassword
      };

      if (tokenParam) {
        payload.token = tokenParam;
      } else {
        payload.email = email.trim();
        payload.code = code.trim();
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link or code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07132c] via-[#0b1f47] to-[#152e66] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-3 shadow-inner">
            <FaShieldAlt className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ConvertScanToCAD</h1>
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mt-1">
            Account Security
          </p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCheckCircle className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Complete!</h2>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been successfully updated. You can now use your new password to access your account.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              Sign In to Your Account
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create New Password</h2>
              <p className="text-gray-500 text-xs mt-1">
                {tokenParam 
                  ? 'Enter your new secure password below to reset your credentials.' 
                  : 'Enter your email, 6-digit verification code, and new password below.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                <FaExclamationCircle className="text-red-500 text-base shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!tokenParam && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      6-Digit Verification Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-center font-mono tracking-widest text-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {tokenParam && emailParam && (
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 mb-2">
                  Resetting password for: <span className="font-semibold">{emailParam}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && (
                <div className="text-xs flex items-center gap-1.5 mt-1">
                  {newPassword === confirmPassword ? (
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
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <FaKey className="text-sm" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
              >
                <FaArrowLeft className="text-[10px]" /> Back to Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
