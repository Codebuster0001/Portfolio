import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Structural token data representing email contact transmission
const codeLines = [
  {
    tokens: [
      { text: 'import ', type: 'keyword' },
      { text: '{ ', type: 'punctuation' },
      { text: 'mailer ', type: 'variable' },
      { text: '} ', type: 'punctuation' },
      { text: 'from ', type: 'keyword' },
      { text: '"contact-api"', type: 'string' },
      { text: ';', type: 'punctuation' }
    ]
  },
  {
    tokens: [] // Blank line
  },
  {
    tokens: [
      { text: 'const ', type: 'keyword' },
      { text: 'message ', type: 'variable' },
      { text: '= ', type: 'operator' },
      { text: '{', type: 'punctuation' }
    ]
  },
  {
    tokens: [
      { text: '  sender: ', type: 'property' },
      { text: '"visitor@domain.com"', type: 'string' },
      { text: ',', type: 'punctuation' }
    ]
  },
  {
    tokens: [
      { text: '  subject: ', type: 'property' },
      { text: '"Let\'s Collaborate!"', type: 'string' },
      { text: ',', type: 'punctuation' }
    ]
  },
  {
    tokens: [
      { text: '  body: ', type: 'property' },
      { text: '"Building something amazing!"', type: 'string' }
    ]
  },
  {
    tokens: [
      { text: '};', type: 'punctuation' }
    ]
  },
  {
    tokens: [] // Blank line
  },
  {
    tokens: [
      { text: 'await ', type: 'keyword' },
      { text: 'mailer', type: 'variable' },
      { text: '.', type: 'punctuation' },
      { text: 'send', type: 'function' },
      { text: '(', type: 'punctuation' },
      { text: 'message', type: 'variable' },
      { text: ');', type: 'punctuation' }
    ]
  },
  {
    tokens: [
      { text: 'console', type: 'variable' },
      { text: '.', type: 'punctuation' },
      { text: 'log', type: 'function' },
      { text: '(', type: 'punctuation' },
      { text: '"Message delivered! 🚀"', type: 'string' },
      { text: ');', type: 'punctuation' }
    ]
  }
];

// Syntax styling maps
const tokenStyles = {
  keyword: 'text-purple-400 font-semibold',
  variable: 'text-blue-400',
  operator: 'text-pink-400',
  property: 'text-cyan-400',
  string: 'text-green-400',
  punctuation: 'text-zinc-500',
  function: 'text-yellow-400'
};

export default function ContactCodeAnimation() {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let lineIdx = 0;
    let tokenIdx = 0;
    let charIdx = 0;

    const typeChar = () => {
      if (!isMounted) return;

      const currentLine = codeLines[lineIdx];
      if (!currentLine) {
        // Complete! Loop restart delay
        setTimeout(() => {
          if (isMounted) {
            setCurrentLineIdx(0);
            setCurrentTokenIdx(0);
            setCurrentCharIdx(0);
            setRestartTrigger(prev => prev + 1);
          }
        }, 3500);
        return;
      }

      // Handle blank lines
      if (currentLine.tokens.length === 0) {
        setTimeout(() => {
          if (isMounted) {
            lineIdx++;
            tokenIdx = 0;
            charIdx = 0;
            setCurrentLineIdx(lineIdx);
            setCurrentTokenIdx(tokenIdx);
            setCurrentCharIdx(charIdx);
            typeChar();
          }
        }, 250);
        return;
      }

      const currentToken = currentLine.tokens[tokenIdx];
      if (!currentToken) {
        // Pause between lines
        const linePause = 450 + Math.random() * 200;
        setTimeout(() => {
          if (isMounted) {
            lineIdx++;
            tokenIdx = 0;
            charIdx = 0;
            setCurrentLineIdx(lineIdx);
            setCurrentTokenIdx(tokenIdx);
            setCurrentCharIdx(charIdx);
            typeChar();
          }
        }, linePause);
        return;
      }

      if (charIdx < currentToken.text.length) {
        charIdx++;
        setCurrentCharIdx(charIdx);
        
        // Random typing delays
        const typingSpeed = 30 + Math.random() * 50;
        setTimeout(typeChar, typingSpeed);
      } else {
        tokenIdx++;
        charIdx = 0;
        setCurrentTokenIdx(tokenIdx);
        setCurrentCharIdx(charIdx);
        setTimeout(typeChar, 10);
      }
    };

    const initialWait = setTimeout(typeChar, 1200);

    return () => {
      isMounted = false;
      clearTimeout(initialWait);
    };
  }, [restartTrigger]);

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-full relative rounded-[2rem] border border-white/5 bg-[#0e1324]/85 backdrop-blur-2xl shadow-2xl p-6 font-mono text-xs sm:text-sm select-none"
    >
      {/* Glow Blur Gradient */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-[2rem] blur-xl opacity-30 pointer-events-none" />

      {/* OS Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-[11px] font-medium text-zinc-500 ml-2 font-mono">send_message.js</span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">UTF-8</div>
      </div>

      {/* Typing Lines */}
      <div className="space-y-1.5 overflow-x-auto min-h-[200px]">
        {codeLines.map((line, lineIdx) => {
          if (lineIdx > currentLineIdx) return null;

          const isCurrentLine = lineIdx === currentLineIdx;

          return (
            <div key={lineIdx} className="flex items-start">
              {/* Line indicator */}
              <span className="w-6 text-zinc-600 text-right pr-3 select-none text-[11px] sm:text-xs">
                {lineIdx + 1}
              </span>

              {/* Tokens */}
              <div className="flex-1 flex flex-wrap leading-relaxed">
                {line.tokens.map((token, tokenIdx) => {
                  if (tokenIdx < currentTokenIdx || !isCurrentLine) {
                    return (
                      <span key={tokenIdx} className={tokenStyles[token.type] || 'text-zinc-300'}>
                        {token.text}
                      </span>
                    );
                  }

                  if (tokenIdx === currentTokenIdx && isCurrentLine) {
                    return (
                      <span key={tokenIdx} className={tokenStyles[token.type] || 'text-zinc-300'}>
                        {token.text.substring(0, currentCharIdx)}
                      </span>
                    );
                  }

                  return null;
                })}

                {/* Laser Cursor */}
                {isCurrentLine && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-1.5 h-4 sm:h-5 bg-blue-500 ml-0.5 self-center shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
