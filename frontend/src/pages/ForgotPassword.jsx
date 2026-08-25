import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <Link to="/login" className="inline-flex items-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back to login
      </Link>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Forgot password?</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start">
          <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">{apiError}</span>
        </div>
      )}

      {success ? (
        <div className="text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check your email</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            We sent a password reset link to your email address.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Didn't receive the email? <br />
            <button 
              onClick={() => setSuccess(false)}
              className="text-pink-500 hover:text-pink-600 font-medium mt-2"
            >
              Click to try again
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full pl-12 pr-5 py-3.5 bg-zinc-900/5 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-zinc-900 dark:text-white shadow-inner"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 ml-2">{errors.email.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-medium rounded-full transition-colors focus:ring-4 focus:ring-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_16px_-6px_rgba(236,72,153,0.5)] flex justify-center items-center h-14"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Reset password'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
