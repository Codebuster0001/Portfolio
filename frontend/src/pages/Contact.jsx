import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Terminal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSubmitContactMutation } from '../services/contactApi';

export default function Contact() {
  const [submitContact] = useSubmitContactMutation();

  // Input fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msgText, setMsgText] = useState('');

  // Terminal and interaction state
  const [logs, setLogs] = useState([
    { text: 'System initialized. Listening on port 3000...', type: 'system' },
    { text: 'Ready to compile. Awaiting user input parameters.', type: 'system' }
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const logsContainerRef = useRef(null);

  // Scroll to bottom of terminal when logs update without scrolling the window
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Log message helper
  const addLog = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { text: `[${timestamp}] ${text}`, type }]);
  };

  // Compile and run the code form
  const handleRunCode = async (e) => {
    e.preventDefault();
    if (isCompiling || isSuccess) return;

    setIsCompiling(true);
    addLog('Initializing message compilation...', 'info');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = msgText.trim();

    if (!trimmedName) {
      addLog('TypeError: Cannot compile property "name". String is empty.', 'error');
      setIsCompiling(false);
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      addLog('ValidationError: Invalid property value for "email". Expected format is: name@domain.com', 'error');
      setIsCompiling(false);
      return;
    }
    if (!trimmedMsg) {
      addLog('SyntaxError: Property "message" cannot contain an empty string literal.', 'error');
      setIsCompiling(false);
      return;
    }

    addLog('Source code compiled successfully with 0 warnings.', 'success');
    addLog('Executing async function sendMessage(message)...', 'info');
    addLog('POST query payload generated. Resolving backend API...', 'info');

    try {
      await submitContact({ name: trimmedName, email: trimmedEmail, message: trimmedMsg, source: 'portfolio' }).unwrap();
      
      addLog('Secure TLS Connection established. Sending JSON payload to gateway...', 'info');
      addLog('Status code: 200 OK. Response successfully received from server.', 'success');
      addLog('Message delivered! Thank you for connecting. ✅', 'success');
      
      setIsCompiling(false);
      setIsSuccess(true);
      
      // Auto reset the form and clear the message after 5 seconds
      setTimeout(() => {
        handleReset();
      }, 5000);

    } catch (err) {
      addLog(`FetchError: POST request failed. Server responded with error.`, 'error');
      if (err.data?.message || err.data?.title) {
        addLog(`Server Output: ${err.data?.message || err.data?.title}`, 'error');
      }
      setIsCompiling(false);
    }
  };

  // Reset form to write another message
  const handleReset = () => {
    setName('');
    setEmail('');
    setMsgText('');
    setIsSuccess(false);
    setLogs([
      { text: 'Developer Console flushed. Listening on port 3000...', type: 'system' },
      { text: 'Ready to compile. Awaiting user input parameters.', type: 'system' }
    ]);
  };

  return (
    <div className="w-full py-16 text-white relative">
      
      {/* Glow Blur Gradient Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-6">
        
        {/* Title branding */}
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Interactive <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 font-mono">contact.js</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            Interact with the live script below by writing your information inside the string fields, then click run to execute the send method.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: LIVE CODE EDITOR FORM (Lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* VS CODE IDE WRAPPER */}
            <div className="rounded-2xl border border-white/5 bg-[#080b14]/90 backdrop-blur-xl overflow-hidden">
              
              {/* Tab Header bar */}
              <div className="bg-[#0f1424]/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  
                  {/* File Tab indicator */}
                  <span className="text-[11px] font-medium text-zinc-300 ml-4 font-mono bg-[#080b14] px-3 py-1 rounded-t-lg border-t border-x border-white/5">
                    contact.js
                  </span>
                </div>

                {/* PLAY / RUN BUTTON */}
                <motion.button
                  whileHover={{ scale: isSuccess ? 1 : 1.05 }}
                  whileTap={{ scale: isSuccess ? 1 : 0.95 }}
                  onClick={handleRunCode}
                  disabled={isCompiling || isSuccess}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all select-none shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
                    isSuccess
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : isCompiling
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-yellow-500/5'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  {isCompiling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      COMPILING
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      RUN CODE
                    </>
                  )}
                </motion.button>
              </div>

              {/* IDE Editor Container */}
              <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none">
                <div className="space-y-2">
                  
                  {/* Line 1 */}
                  <div className="flex">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">1</span>
                    <div>
                      <span className="text-purple-400 font-semibold">const</span> <span className="text-blue-400">message</span> = <span className="text-zinc-500">{`{`}</span>
                    </div>
                  </div>

                  {/* Line 2: Name Input */}
                  <div className="flex items-center">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">2</span>
                    <div className="flex items-center flex-wrap">
                      <span className="text-cyan-400 ml-4">name:</span> <span className="text-green-400 ml-1">"</span>
                      <input
                        type="text"
                        required
                        disabled={isCompiling || isSuccess}
                        value={name}
                        placeholder="Type your name..."
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-none outline-none text-green-400 p-0 m-0 w-36 sm:w-44 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-green-800/60 font-mono text-xs sm:text-sm h-5 caret-blue-400"
                      />
                      <span className="text-green-400">"</span><span className="text-zinc-500">,</span>
                    </div>
                  </div>

                  {/* Line 3: Email Input */}
                  <div className="flex items-center">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">3</span>
                    <div className="flex items-center flex-wrap">
                      <span className="text-cyan-400 ml-4">email:</span> <span className="text-green-400 ml-1">"</span>
                      <input
                        type="email"
                        required
                        disabled={isCompiling || isSuccess}
                        value={email}
                        placeholder="your@email.com..."
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-none outline-none text-green-400 p-0 m-0 w-44 sm:w-52 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-green-800/60 font-mono text-xs sm:text-sm h-5 caret-blue-400"
                      />
                      <span className="text-green-400">"</span><span className="text-zinc-500">,</span>
                    </div>
                  </div>

                  {/* Line 4: Message text Input */}
                  <div className="flex items-start">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right pt-0.5">4</span>
                    <div className="flex-1 flex items-start flex-wrap">
                      <span className="text-cyan-400 ml-4">message:</span> <span className="text-green-400 ml-1">"</span>
                      <textarea
                        required
                        rows="2"
                        disabled={isCompiling || isSuccess}
                        value={msgText}
                        placeholder="Write your email body here..."
                        onChange={(e) => setMsgText(e.target.value)}
                        className="bg-transparent border-none outline-none text-green-400 p-0 m-0 flex-1 min-w-[200px] focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-green-800/60 font-mono text-xs sm:text-sm resize-none h-12 caret-blue-400 leading-normal"
                      />
                      <span className="text-green-400">"</span>
                    </div>
                  </div>

                  {/* Line 5 */}
                  <div className="flex">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">5</span>
                    <div>
                      <span className="text-zinc-500">{`};`}</span>
                    </div>
                  </div>

                  {/* Line 6 */}
                  <div className="flex">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">6</span>
                    <div />
                  </div>

                  {/* Line 7 */}
                  <div className="flex">
                    <span className="w-8 text-zinc-600 select-none pr-3 text-right">7</span>
                    <div>
                      <span className="text-yellow-400">sendMessage</span><span className="text-zinc-500">(</span><span className="text-blue-400">message</span><span className="text-zinc-500">);</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* RESET / WRITE ANOTHER TRIGGER */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-green-500/10 bg-green-500/5 backdrop-blur-md"
                >
                  <span className="text-xs text-green-400/90 font-medium">Message uploaded successfully!</span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-green-500 text-zinc-950 text-[11px] font-bold tracking-wider uppercase hover:bg-green-400 transition-all"
                  >
                    Write New Code
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* COLUMN 2: DEVELOPER CONSOLE OUTPUT (Lg: 5 cols) */}
          <div className="lg:col-span-5 h-full">
            
            {/* TERMINAL PANEL */}
            <div className="rounded-2xl border border-white/5 bg-[#06080e]/95 backdrop-blur-xl overflow-hidden flex flex-col h-[320px] lg:h-[352px]">
              
              {/* Terminal Header */}
              <div className="bg-[#0b0f1a] px-4 py-3 border-b border-white/5 flex items-center gap-2 select-none">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px] font-semibold text-zinc-400 font-mono tracking-wider">
                  DEVELOPER CONSOLE (npm run output)
                </span>
              </div>

              {/* Scrollable Logs Body */}
              <div ref={logsContainerRef} className="p-4 flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] sm:text-xs select-none custom-scrollbar">
                {logs.map((log, index) => {
                  let colorClass = 'text-zinc-400';
                  let icon = null;

                  if (log.type === 'system') {
                    colorClass = 'text-blue-500/80';
                  } else if (log.type === 'error') {
                    colorClass = 'text-red-400 font-bold';
                    icon = <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-red-400" />;
                  } else if (log.type === 'success') {
                    colorClass = 'text-green-400 font-semibold';
                    icon = <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-green-400" />;
                  } else if (log.type === 'info') {
                    colorClass = 'text-zinc-300';
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`leading-relaxed break-words ${colorClass}`}
                    >
                      {icon}
                      {log.text}
                    </motion.div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}