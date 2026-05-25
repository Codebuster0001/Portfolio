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
          <div className="flex flex-wrap gap-4 items-center bg-white/50 dark:bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input 
                type="text"
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={handleSearch}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
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
            <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Failed to load contacts.</div>
          ) : contactsData?.items?.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900/30 rounded-xl border border-slate-200 dark:border-zinc-800 border-dashed">
              No contacts found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {contactsData?.items?.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => handleSelectContact(contact)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedContact?.id === contact.id 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : !contact.isRead
                        ? 'bg-white dark:bg-zinc-900/80 border-zinc-700 hover:border-zinc-500'
                        : 'bg-white dark:bg-zinc-900/30 border-slate-200 dark:border-zinc-800 hover:border-zinc-700 opacity-70'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleReadStatus(contact); }}
                        className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-colors"
                        title={contact.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {contact.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4 text-blue-400" />}
                      </button>
                      <div>
                        <h3 className={`font-semibold ${!contact.isRead ? 'text-slate-900 dark:text-white' : 'text-zinc-300'}`}>
                          {contact.name}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(contact.status)}
                      <span className="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 ml-7">
                    {contact.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {contactsData?.totalPages > 1 && (
            <div className="flex justify-between items-center py-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded bg-white dark:bg-zinc-900 text-white disabled:opacity-50"
              ><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-slate-500 dark:text-zinc-400">Page {page} of {contactsData.totalPages}</span>
              <button 
                disabled={page === contactsData.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded bg-white dark:bg-zinc-900 text-white disabled:opacity-50"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}

        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="sticky top-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Message Details</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleReadStatus(selectedContact)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title={selectedContact.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {selectedContact.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedContact.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">From</label>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedContact.name}</p>
                  <p className="text-sm text-blue-400"><a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a></p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Received</label>
                  <p className="text-sm text-zinc-300">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>

                <div className="pt-4">
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">Message</label>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Reply to Sender</label>
                  {selectedContact.isReplied && (
                    <div className="mb-3 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      A reply has already been sent to this message.
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors mb-3 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyText.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {isReplying ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <label className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Metadata</label>
                  <div className="text-xs text-slate-400 dark:text-zinc-500 space-y-1">
                    <p><span className="text-slate-500 dark:text-zinc-400">IP:</span> {selectedContact.ipAddress || 'Unknown'}</p>
                    <p><span className="text-slate-500 dark:text-zinc-400">Source:</span> {selectedContact.source}</p>
                    <p className="break-all"><span className="text-slate-500 dark:text-zinc-400">Agent:</span> {selectedContact.userAgent}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900/30 rounded-xl border border-slate-200 dark:border-zinc-800 border-dashed p-6 text-center">
              <Mail className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
