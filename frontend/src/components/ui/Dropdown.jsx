import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function Dropdown({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option",
  icon: Icon = null,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);

  // Recalculate coordinates of the trigger button in viewport space
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Keep coordinates locked to trigger button on window resize or scroll
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-[#080b14]/90 border border-zinc-800/80 hover:border-zinc-700 hover:text-white px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 transition-all duration-300 focus:outline-none focus:border-blue-500/80 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
          {selectedOption.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180 text-white' : ''
          }`} 
        />
      </button>

      {/* Render Dropdown outside parent DOM tree using React Portal to overlay ALL elements */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backplane Interaction Blocker (Prevents click-through leaks completely) */}
              <div 
                className="fixed inset-0 z-[9998] bg-black/10 cursor-default"
                onClick={() => setIsOpen(false)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              />

              {/* Float Portal Dropdown Panel */}
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                }}
                className="z-[9999] bg-[#0c101d] border border-zinc-800/80 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl p-1.5 overflow-hidden select-none"
              >
                {options.map((option) => {
                  const isActive = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/10' 
                          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent'
                      }`}
                    >
                      <span>{option.label}</span>
                      
                      {/* Spring Active Check Indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        >
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      
    </div>
  );
}
