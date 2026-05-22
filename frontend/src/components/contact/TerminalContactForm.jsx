import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSubmitContactMutation } from '../../services/contactApi';

const TerminalContactForm = () => {
  const [submitContact, { isLoading }] = useSubmitContactMutation();
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [activeField, setActiveField] = useState('name');
  const [logs, setLogs] = useState([
    { id: 1, text: 'systemctl start contact.service', type: 'info' },
    { id: 2, text: 'Establishing secure connection...', type: 'info' },
    { id: 3, text: 'Connection established. Ready for input.', type: 'success' },
  ]);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const terminalBodyRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs, activeField, status]);

  const addLog = (text, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now(), text, type }]);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e, fieldName, nextFieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!formData[fieldName].trim()) {
        addLog(`Error: ${fieldName} cannot be empty.`, 'error');
        return;
      }
      addLog(`Received ${fieldName}: ${formData[fieldName]}`, 'success');
      
      if (nextFieldName) {
        setActiveField(nextFieldName);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addLog('Error: All fields are required to establish link.', 'error');
      return;
    }

    setStatus('loading');
    addLog('Initiating payload transfer...', 'info');

    try {
      await submitContact({ ...formData, source: 'portfolio' }).unwrap();
      setStatus('success');
      addLog('Payload transfer complete. Signal received.', 'success');
      addLog('Status 200 OK: Admin notified successfully.', 'success');
    } catch (err) {
      setStatus('error');
      addLog(`Transfer failed: ${err.data?.title || 'Connection lost.'}`, 'error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono">
      {/* Terminal Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <Terminal className="w-3.5 h-3.5" />
          <span>contact.sh — bash — 80x24</span>
        </div>
        <div className="w-16" /> {/* spacer for balance */}
      </div>

      {/* Terminal Body */}
      <div 
        ref={terminalBodyRef}
        className="p-6 md:p-8 h-[400px] md:h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-4 text-sm md:text-base"
      >
        
        {/* Logs */}
        <div className="flex flex-col gap-2 mb-4">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-zinc-400'
                }`}
              >
                <span className="text-zinc-600 mr-2">{'>'}</span>
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Form Inputs (Terminal Style) */}
        {status === 'idle' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-green-400">
            {/* Name Input */}
            {activeField === 'name' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                <span className="text-blue-400 mr-2">guest@portfolio:~$</span>
                <span className="text-yellow-400 mr-2">Enter Name:</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'name', 'email')}
                  className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-400"
                  autoComplete="off"
                />
              </motion.div>
            )}

            {/* Email Input */}
            {activeField === 'email' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                <span className="text-blue-400 mr-2">guest@portfolio:~$</span>
                <span className="text-yellow-400 mr-2">Enter Email:</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'email', 'message')}
                  className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-400"
                  autoComplete="off"
                />
              </motion.div>
            )}

            {/* Message Input */}
            {activeField === 'message' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="text-blue-400 mr-2">guest@portfolio:~$</span>
                  <span className="text-yellow-400">Enter Message (Press Shift+Enter for new line, Enter to submit):</span>
                </div>
                <div className="flex">
                  <span className="text-zinc-500 mr-2">{'>'}</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleKeyDown(e, 'message', null);
                      }
                    }}
                    rows={4}
                    className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-400 resize-none"
                  />
                </div>
              </motion.div>
            )}
          </form>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex items-center text-blue-400 mt-4">
            <Loader2 className="w-5 h-5 animate-spin mr-3" />
            <span className="animate-pulse">Transmitting secure packet...</span>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-400 mb-2">Connection Established</h3>
            <p className="text-green-400/80 text-sm">Your message has been securely transmitted to the server. Awaiting response.</p>
            <button 
              onClick={() => {
                setFormData({ name: '', email: '', message: '' });
                setActiveField('name');
                setStatus('idle');
                addLog('--- NEW SESSION INITIATED ---', 'info');
              }}
              className="mt-6 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors text-sm"
            >
              Start New Session
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TerminalContactForm;
