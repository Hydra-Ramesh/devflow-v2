import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AnimatedBackground from './components/layout/AnimatedBackground';
import { Toaster } from 'react-hot-toast';

// Lazy loaded pages for better code splitting
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
// const Home = React.lazy(() => import('./pages/Home'));
// const Profile = React.lazy(() => import('./pages/Profile'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));


// A wrapper for page transitions
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="relative z-10 w-full flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);

// Fallback loader while lazy loading components
const PageLoader = () => (
  <div className="flex-grow flex items-center justify-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { initialize, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;
  }

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/auth/callback' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <div className="relative min-h-screen font-sans antialiased text-zinc-900 dark:text-zinc-50 flex flex-col">
      <AnimatedBackground />
      <Toaster position="bottom-right" />
      {!isAuthRoute && <Navbar />}
      
      {isAuthRoute ? (
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
              <Route path="/auth/callback" element={<PageWrapper><AuthCallback /></PageWrapper>} />
              <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
              <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      ) : (
        <div className="flex-grow flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <Sidebar />
          <main className="flex-grow min-w-0 pl-0 lg:pl-8 py-8 flex flex-col relative">
            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route element={<ProtectedRoute />}>
                    {/* <Route path="/" element={<PageWrapper><Home /></PageWrapper>} /> */}
                  </Route>
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
