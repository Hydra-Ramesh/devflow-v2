import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { socket, connectSocket } from '../../services/socket';
import api from '../../services/api';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [notifRes, chatRes] = await Promise.all([
          api.get('/notifications'),
          api.get('/conversations')
        ]);
        
        let notifs = notifRes.data.notifications || [];
        let count = notifRes.data.unreadCount || 0;
        
        // Synthesize chat notifications from unread conversations
        const unreadChats = (chatRes.data.conversations || []).filter(c => c.unreadCount > 0);
        
        unreadChats.forEach(c => {
          const otherUser = c.user1Id === user.id ? c.user2 : c.user1;
          notifs.push({
            id: `chat_${c.id}`,
            type: 'NEW_MESSAGE',
            entityId: c.id,
            actor: otherUser,
            createdAt: c.updatedAt,
            isRead: false,
            content: c.lastMessage
          });
          // We count each unread conversation as 1 unread item in the bell
          count += 1;
        });
        
        // Sort by newest
        notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setNotifications(notifs.slice(0, 30));
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    connectSocket();
    
    const joinUserRoom = () => {
      socket.emit('join_user', user.id);
    };

    if (socket.connected) {
      joinUserRoom();
    } else {
      socket.on('connect', joinUserRoom);
    }

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    };

    const handleChatNotification = (message) => {      
      // If the user is actively on the chat page, let the Chat UI handle it
      if (window.location.pathname === '/chat') {
        return;
      }
      
      const chatNotif = {
        id: `chat_${message.conversationId}`,
        type: 'NEW_MESSAGE',
        entityId: message.conversationId,
        actor: message.sender,
        createdAt: message.createdAt,
        isRead: false,
        content: message.content
      };
      
      setNotifications((prev) => {
        const filtered = prev.filter(n => n.id !== chatNotif.id);
        const existing = prev.find(n => n.id === chatNotif.id);
        
        // Only increment the bell count if this conversation wasn't already unread in the bell
        if (!existing || existing.isRead) {
          setUnreadCount((c) => c + 1);
        }
        
        return [chatNotif, ...filtered].slice(0, 30);
      });
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('chat_notification', handleChatNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('chat_notification', handleChatNotification);
      socket.off('connect', joinUserRoom);
    };
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      if (id.startsWith('chat_')) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        return;
      }
      await api.post(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className={`block p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <Link to={notif.type === 'MESSAGE_REQUEST' || notif.type === 'NEW_MESSAGE' ? `/chat?conversationId=${notif.entityId}` : `/question/${notif.entityId}`} className="flex gap-3">
                        <img 
                          src={notif.actor?.avatarUrl || `https://ui-avatars.com/api/?name=${notif.actor?.fullName || 'User'}`} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-tight">
                            <span className="font-semibold text-zinc-900 dark:text-white mr-1">
                              {notif.actor?.fullName}
                            </span>
                            {notif.type === 'COMMENT' && 'commented on your post'}
                            {notif.type === 'ANSWER' && 'answered your question'}
                            {notif.type === 'UPVOTE' && 'upvoted your post'}
                            {notif.type === 'DOWNVOTE' && 'downvoted your post'}
                            {notif.type === 'ACCEPT' && 'accepted your answer'}
                            {notif.type === 'MESSAGE_REQUEST' && 'sent you a message request'}
                            {notif.type === 'NEW_MESSAGE' && `sent you a message: ${notif.content || 'Photo'}`}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                        )}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
