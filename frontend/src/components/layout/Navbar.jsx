import { Link } from 'react-router-dom';
import { Code2, LogOut, User, Sun, Moon, Monitor, Trophy, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import ReportBugModal from '../shared/ReportBugModal';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-zinc-900 dark:text-white group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20"
              >
                <Code2 className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                DevFlow
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon className="w-5 h-5" />
            </motion.button>
            {user ? (
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBugModalOpen(true)}
                  className="p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Report a Bug"
                >
                  <Bug className="w-5 h-5" />
                </motion.button>
                <NotificationBell />
                <Link to="/leaderboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm font-medium px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </motion.div>
                </Link>
                <Link to={`/profile/${user.id}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm font-medium px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors">
                    {(user.avatarUrl || user.avatar_url) ? (
                      <img src={user.avatarUrl || user.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Profile
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="text-sm font-medium px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm font-medium px-4 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    Log in
                  </motion.div>
                </Link>
                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25">
                    Sign up
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      <ReportBugModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </motion.nav>
  );
}
