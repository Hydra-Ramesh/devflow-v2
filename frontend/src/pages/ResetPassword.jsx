import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const password = watch("password");

  const onSubmit = async (data) => {
    if (!token || !id) {
      setApiError('Invalid password reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await api.post('/auth/reset-password', { 
        id, 
        token, 
        password: data.password 
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Password Reset Successful</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Your password has been changed successfully. You are being redirected to login...
        </p>
        <Link to="/login" className="text-pink-500 hover:text-pink-600 font-medium">
          Click here if you aren't redirected
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Set new password</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Must be at least 8 characters.
        </p>
      </div>

      {!token || !id ? (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm flex flex-col items-center text-center">
          <span className="mb-4">Invalid password reset link.</span>
          <Link to="/forgot-password" className="px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
            Request a new link
          </Link>
        </div>
      ) : (
        <>
          {apiError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-relaxed">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className="w-full pl-12 pr-5 py-3.5 bg-zinc-900/5 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-zinc-900 dark:text-white shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <span className="text-xs text-red-500 ml-2">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Confirm Password is required',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="w-full pl-12 pr-5 py-3.5 bg-zinc-900/5 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-zinc-900 dark:text-white shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <span className="text-xs text-red-500 ml-2">{errors.confirmPassword.message}</span>}
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
        </>
      )}
    </div>
  );
};

export default ResetPassword;
