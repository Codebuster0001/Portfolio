import React from 'react';
import { motion } from 'framer-motion';
import { MailOpen, Mail, Trash2, Reply, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetContactsQuery } from '../../store/apiSlice';
import { Skeleton } from '../ui/Skeleton';

export default React.memo(function MessageTable() {
  const navigate = useNavigate();
  const { data: contactsData, isLoading, error } = useGetContactsQuery({ page: 1, pageSize: 5 });
  const messages = contactsData?.items || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[450px] flex flex-col"
    >
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Recent Messages</h2>
          <p className="text-sm text-zinc-400">Inquiries from your contact form</p>
        </div>
        <button 
          onClick={() => navigate('/messages')}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 group"
        >
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="divide-y divide-white/5 flex-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-start gap-4 animate-pulse">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-12 text-center text-red-400">
            Failed to load messages.
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No recent messages.
          </div>
        ) : messages.map((msg, idx) => (
          <motion.div 
            key={msg.id}
            onClick={() => navigate('/messages')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
            className={`p-4 hover:bg-white/5 transition-colors flex items-start gap-4 group cursor-pointer ${msg.isRead ? 'opacity-70' : 'opacity-100'}`}
          >
            <div className={`p-2 rounded-full ${msg.isRead ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500/20 text-blue-400'}`}>
              {msg.isRead ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${msg.isRead ? 'text-zinc-300' : 'text-white'}`}>{msg.name}</h4>
                <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mb-1">{msg.email}</p>
              <p className={`text-sm truncate ${msg.isRead ? 'text-zinc-500' : 'text-zinc-300'}`}>{msg.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
