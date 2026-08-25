import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { signInWithEmail, signInWithProvider } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setAuthError(null);
      await signInWithEmail(data.email, data.password);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setAuthError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="text-left space-y-2">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-lg shadow-lg rotate-12 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">DevFlow</span>
        </div>
        
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Please Enter your Account details</p>
      </div>

      {authError && (
        <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-5 py-3.5 bg-zinc-900/5 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-zinc-900 dark:text-white shadow-inner"
            placeholder="johndoe@gmail.com"
          />
          {errors.email && <span className="text-xs text-red-500 ml-2">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-5 py-3.5 bg-zinc-900/5 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-zinc-900 dark:text-white shadow-inner"
            placeholder="••••••••"
          />
          {errors.password && <span className="text-xs text-red-500 ml-2">{errors.password.message}</span>}
        </div>

        <div className="flex items-center justify-between px-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-pink-500 focus:ring-pink-500 accent-pink-500" />
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">Keep me logged in</span>
          </label>
          <Link to="/forgot-password" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
            Forgot Password
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 rounded-full shadow-lg shadow-pink-500/20 text-md font-bold text-white bg-gradient-to-r from-[#ff8c82] to-[#ff6b8b] hover:from-[#ff7a6f] hover:to-[#ff5678] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign in'}
        </button>
      </form>

      {/* OAuth Buttons */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
        <span className="text-sm text-zinc-400">or continue with</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => window.location.href = 'http://localhost:5001/oauth2/authorization/google'}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>
        <button
          type="button"
          onClick={() => window.location.href = 'http://localhost:5001/oauth2/authorization/github'}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 dark:invert" alt="GitHub" />
          GitHub
        </button>
      </div>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-zinc-900 dark:text-white hover:underline decoration-2 underline-offset-4">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
