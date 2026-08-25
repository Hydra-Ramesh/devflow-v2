import { Link, useLocation } from 'react-router-dom';
import { Home, HelpCircle, Bot, MessageSquare, FileText, Shield, Hash, Users, Building2, Radar } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'AI Assist', href: '/ai-assist', icon: Bot, isNew: true },
    { name: 'Tags', href: '/tags', icon: Hash },
    { name: 'Tech Radar', href: '/tech-radar', icon: Radar, isNew: true },
  ];

  const social = [
    { name: 'Chat', href: '/chat', icon: MessageSquare, isNew: true },
    { name: 'Articles', href: '/articles', icon: FileText, isNew: true },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Talent Matchmaking', href: '/talent', icon: Users, isNew: true },
  ];

  const admin = [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
    
    return (
      <Link to={item.href}>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${
            isActive 
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          {isActive && (
            <motion.div 
              layoutId="activeTab"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" 
            />
          )}
          <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'}`} />
          <span className="flex-grow">{item.name}</span>
          {item.isNew && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
              New
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto border-r border-zinc-200/50 dark:border-zinc-800/50 hidden lg:block bg-white/30 dark:bg-[#0a0a0a]/30 backdrop-blur-sm">
      <div className="px-3 py-6 space-y-8">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Social / Community */}
        <div>
          <h4 className="px-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Community
          </h4>
          <div className="space-y-1">
            {social.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Admin Navigation */}
        {user?.role === 'ADMIN' && (
          <div>
            <h4 className="px-3 text-xs font-semibold text-fuchsia-500 dark:text-fuchsia-400 uppercase tracking-wider mb-2">
              Admin
            </h4>
            <div className="space-y-1">
              {admin.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
