import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MailOpen, AlertCircle, Loader2, Trash2, Search, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { 
  useGetContactsQuery, 
  useUpdateContactStatusMutation, 
  useMarkContactAsReadMutation, 
  useDeleteContactMutation,
  useReplyToContactMutation
} from '../../store/apiSlice';
import { useToast } from '@/components/ui/Toast';

export default function ContactManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { addToast } = useToast();

  const { data: contactsData, isLoading, error } = useGetContactsQuery({ 
    page, pageSize: 10, search, status: statusFilter 
  });

  const [updateStatus] = useUpdateContactStatusMutation();
  const [markAsRead] = useMarkContactAsReadMutation();
  const [deleteContact] = useDeleteContactMutation();
  const [replyToContact] = useReplyToContactMutation();

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setReplyText('');
    setIsReplying(false);
    
    // Auto mark as read when opened (like WhatsApp)
    if (!contact.isRead) {
      try {
        await markAsRead({ id: contact.id, isRead: true }).unwrap();
      } catch (err) {
        console.error('Failed to auto-mark as read', err);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await replyToContact({ id: selectedContact.id, message: replyText }).unwrap();
      setReplyText('');
      addToast('Reply sent successfully!', 'success');
    } catch (err) {
      console.error('Failed to send reply', err);
      addToast('Failed to send reply.', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const toggleReadStatus = async (contact) => {
    try {
      await markAsRead({ id: contact.id, isRead: !contact.isRead }).unwrap();
    } catch (err) {
      console.error('Failed to update read status', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact message?')) {
      try {
        await deleteContact(id).unwrap();
        if (selectedContact?.id === id) setSelectedContact(null);
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/20">Success</span>;
      case 'failed': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/20">Failed</span>;
      default: return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/20">Pending</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mail className="text-blue-400" />
            Contact Messages
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Manage and respond to portfolio inquiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-wrap gap-4 items-center bg-[#FCFCFD] dark:bg-[#111217] p-4 rounded-2xl border border-[#E2E8F0] dark:border-white/5 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-zinc-500" />
              <input 
                type="text"
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={handleSearch}
                className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-[#E2E8F0] dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#F8FAFC] dark:bg-zinc-950 border border-[#E2E8F0] dark:border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 font-medium">Failed to load contacts.</div>
          ) : contactsData?.items?.length === 0 ? (
            <div className="text-center py-12 text-[#64748B] dark:text-zinc-500 bg-[#FCFCFD] dark:bg-[#111217]/30 rounded-2xl border border-[#E2E8F0] dark:border-white/5 border-dashed">
              No contacts found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {contactsData?.items?.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => handleSelectContact(contact)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedContact?.id === contact.id 
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-sm' 
                      : !contact.isRead
                        ? 'bg-[#FCFCFD] dark:bg-[#111217] border-[#E2E8F0] dark:border-white/10 shadow-sm hover:border-blue-500/50'
                        : 'bg-[#FCFCFD]/70 dark:bg-[#111217]/50 border-[#E2E8F0] dark:border-white/5 hover:border-[#64748B]/50 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleReadStatus(contact); }}
                        className="text-[#64748B] dark:text-zinc-500 hover:text-blue-500 transition-colors focus:outline-none"
                        title={contact.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {contact.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4 text-blue-500" />}
                      </button>
                      <div>
                        <h3 className={`font-semibold text-sm ${!contact.isRead ? 'text-[#0F172A] dark:text-white' : 'text-[#64748B] dark:text-zinc-400'}`}>
                          {contact.name}
                        </h3>
                        <p className="text-xs text-[#64748B] dark:text-zinc-500">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(contact.status)}
                      <span className="text-xs text-[#94A3B8] dark:text-zinc-500 whitespace-nowrap">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-zinc-400 line-clamp-2 ml-7">
                    {contact.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {contactsData?.totalPages > 1 && (
            <div className="flex justify-between items-center py-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-[#FCFCFD] dark:bg-[#111217] text-[#0F172A] dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#18181b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              ><ChevronLeft className="w-4 h-4" /></motion.button>
              <span className="text-sm font-medium text-[#64748B] dark:text-zinc-400">Page {page} of {contactsData.totalPages}</span>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={page === contactsData.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-[#FCFCFD] dark:bg-[#111217] text-[#0F172A] dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#18181b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              ><ChevronRight className="w-4 h-4" /></motion.button>
            </div>
          )}

        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="sticky top-24 bg-[#FCFCFD] dark:bg-[#111217] border border-[#E2E8F0] dark:border-white/5 rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E2E8F0] dark:border-white/5">
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Message Details</h2>
                <div className="flex gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleReadStatus(selectedContact)}
                    className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-[#64748B] dark:text-zinc-300 border border-[#E2E8F0] dark:border-white/5 transition-colors focus:outline-none"
                    title={selectedContact.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {selectedContact.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(selectedContact.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 transition-all focus:outline-none"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider">From</label>
                  <p className="text-[#0F172A] dark:text-white font-semibold text-base mt-0.5">{selectedContact.name}</p>
                  <p className="text-sm text-blue-500 font-medium"><a href={`mailto:${selectedContact.email}`} className="hover:underline">{selectedContact.email}</a></p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider">Received</label>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-zinc-300 mt-0.5">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>

                <div className="pt-4">
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider mb-2 block">Message</label>
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950 border border-[#E2E8F0] dark:border-white/5 text-sm text-[#0F172A] dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/5">
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider block mb-2">Reply to Sender</label>
                  {selectedContact.isReplied && (
                    <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                      A reply has already been sent to this message.
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-[#E2E8F0] dark:border-white/5 rounded-2xl p-3.5 text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-3 resize-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendReply}
                    disabled={isReplying || !replyText.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {isReplying ? 'Sending...' : 'Send Reply'}
                  </motion.button>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/5">
                  <label className="text-xs font-bold text-[#64748B] dark:text-zinc-500 uppercase tracking-wider block mb-2">Metadata</label>
                  <div className="text-xs text-[#64748B] dark:text-zinc-500 space-y-1.5 font-mono">
                    <p><span className="font-sans font-semibold text-[#0F172A] dark:text-zinc-400">IP:</span> {selectedContact.ipAddress || 'Unknown'}</p>
                    <p><span className="font-sans font-semibold text-[#0F172A] dark:text-zinc-400">Source:</span> {selectedContact.source}</p>
                    <p className="break-all"><span className="font-sans font-semibold text-[#0F172A] dark:text-zinc-400">Agent:</span> {selectedContact.userAgent}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-[#64748B] dark:text-zinc-500 bg-[#FCFCFD]/50 dark:bg-zinc-900/30 rounded-3xl border border-[#E2E8F0] dark:border-white/5 border-dashed p-6 text-center shadow-inner">
              <Mail className="w-12 h-12 mb-4 opacity-50 text-blue-500" />
              <p className="font-medium text-sm">Select a message to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
