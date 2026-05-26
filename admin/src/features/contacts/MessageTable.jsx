import React from 'react';
import { motion } from 'framer-motion';
import { MailOpen, Mail, Trash2, Reply, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetContactsQuery } from '../../store/apiSlice';
import { Skeleton } from '@/components/ui/Skeleton';

export default React.memo(function MessageTable() {
  const navigate = useNavigate();
  const { data: contactsData, isLoading, error } = useGetContactsQuery({ page: 1, pageSize: 5 });
  const messages = contactsData?.items || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-[#FCFCFD] dark:bg-[#111217] border border-[#E2E8F0] dark:border-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 min-h-[450px] flex flex-col"
    >
      <div className="p-6 border-b border-[#E2E8F0] dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Recent Messages</h2>
          <p className="text-sm text-[#64748B] dark:text-zinc-400">Inquiries from your contact form</p>
        </div>
        <button 
          onClick={() => navigate('/messages')}
          className="text-sm text-blue-500 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1 group focus:outline-none focus-visible:underline"
        >
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="divide-y divide-[#E2E8F0] dark:divide-white/5 flex-1">
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
          <div className="p-12 text-center text-red-400 font-medium">
            Failed to load messages.
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] dark:text-zinc-500 font-medium">
            No recent messages.
          </div>
        ) : messages.map((msg, idx) => (
          <motion.div 
            key={msg.id}
            onClick={() => navigate('/messages')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
            className={`p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-all flex items-start gap-4 group cursor-pointer ${msg.isRead ? 'opacity-80' : 'opacity-100'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors duration-300 ${msg.isRead ? 'bg-[#F8FAFC] dark:bg-zinc-800 text-[#64748B] dark:text-zinc-500' : 'bg-blue-500 text-white shadow-md shadow-blue-500/20'}`}>
              {msg.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-semibold truncate ${msg.isRead ? 'text-[#64748B] dark:text-zinc-400' : 'text-[#0F172A] dark:text-white'}`}>{msg.name}</h4>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.isRead && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow-sm shadow-blue-500/10">Unread</span>
                  )}
                  <span className="text-xs text-[#94A3B8] dark:text-zinc-500 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mb-1 truncate">{msg.email}</p>
              <p className={`text-sm truncate ${msg.isRead ? 'text-[#64748B] dark:text-zinc-400' : 'text-[#0F172A] dark:text-zinc-200'}`}>{msg.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
