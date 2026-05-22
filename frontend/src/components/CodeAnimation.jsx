import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const tokenStyles = {
  keyword: 'text-purple-400 font-semibold',
  variable: 'text-blue-400',
  operator: 'text-pink-400',
  property: 'text-cyan-400',
  string: 'text-green-400',
  punctuation: 'text-zinc-500',
  function: 'text-yellow-400'
};

// Build dynamic code lines from live hero data
function buildCodeLines(name, role, techStack) {
  const skills = Array.isArray(techStack) && techStack.length > 0
    ? techStack
    : ['React', 'Node.js', 'TypeScript', 'MongoDB'];

  const skillTokens = [];
  skills.forEach((tech, idx) => {
    skillTokens.push({ text: `"${tech}"`, type: 'string' });
    if (idx < skills.length - 1) {
      skillTokens.push({ text: ', ', type: 'punctuation' });
    }
  });

  return [
    {
      tokens: [
        { text: 'const ', type: 'keyword' },
        { text: 'developer ', type: 'variable' },
        { text: '= ', type: 'operator' },
        { text: '{', type: 'punctuation' }
      ]
    },
    {
      tokens: [
        { text: '  name: ', type: 'property' },
        { text: `"${name || 'John Doe'}"`, type: 'string' },
        { text: ',', type: 'punctuation' }
      ]
    },
    {
      tokens: [
        { text: '  role: ', type: 'property' },
        { text: `"${role || 'Full Stack Developer'}"`, type: 'string' },
        { text: ',', type: 'punctuation' }
      ]
    },
    {
      tokens: [
        { text: '  skills: ', type: 'property' },
        { text: '[', type: 'punctuation' },
        ...skillTokens,
        { text: ']', type: 'punctuation' },
        { text: ',', type: 'punctuation' }
      ]
    },
    {
      tokens: [{ text: '};', type: 'punctuation' }]
    },
    {
      tokens: [] // Empty line
    },
    {
      tokens: [
        { text: 'developer', type: 'variable' },
        { text: '.', type: 'punctuation' },
        { text: 'buildAmazingThings', type: 'function' },
        { text: '();', type: 'punctuation' }
      ]
    }
  ];
}

export default function CodeAnimation({ techStack, name, role }) {
  const codeLines = useMemo(
    () => buildCodeLines(name, role, techStack),
    [name, role, JSON.stringify(techStack)]
  );

  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Reset animation when hero data changes
  useEffect(() => {
    setCurrentLineIdx(0);
    setCurrentTokenIdx(0);
    setCurrentCharIdx(0);
    setRestartTrigger(t => t + 1);
  }, [name, role, JSON.stringify(techStack)]);

  useEffect(() => {
    let isMounted = true;
    let lineIdx = 0;
    let tokenIdx = 0;
    let charIdx = 0;

    const typeChar = () => {
      if (!isMounted) return;
      const currentLine = codeLines[lineIdx];
      if (!currentLine) {
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

      if (currentLine.tokens.length === 0) {
        setTimeout(() => {
          if (isMounted) {
            lineIdx++; tokenIdx = 0; charIdx = 0;
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
        const linePause = 500 + Math.random() * 250;
        setTimeout(() => {
          if (isMounted) {
            lineIdx++; tokenIdx = 0; charIdx = 0;
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
        const typingSpeed = 35 + Math.random() * 55;
        setTimeout(typeChar, typingSpeed);
      } else {
        tokenIdx++; charIdx = 0;
        setCurrentTokenIdx(tokenIdx);
        setCurrentCharIdx(charIdx);
        setTimeout(typeChar, 10);
      }
    };

    const initialWait = setTimeout(typeChar, 1200);
    return () => { isMounted = false; clearTimeout(initialWait); };
  }, [restartTrigger, codeLines]);

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-full relative rounded-2xl border border-white/5 bg-[#0e1324]/85 backdrop-blur-2xl shadow-2xl p-6 font-mono text-xs sm:text-sm select-none"
    >
      <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-30 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-[11px] font-medium text-zinc-500 ml-2 font-mono">developer.js</span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">UTF-8</div>
      </div>

      <div className="space-y-1.5 overflow-x-auto min-h-[180px]">
        {codeLines.map((line, lineIdx) => {
          if (lineIdx > currentLineIdx) return null;
          const isCurrentLine = lineIdx === currentLineIdx;
          return (
            <div key={lineIdx} className="flex items-start">
              <span className="w-6 text-zinc-600 text-right select-none pr-3 text-[11px] sm:text-xs">
                {lineIdx + 1}
              </span>
              <div className="flex-1 flex flex-wrap leading-relaxed">
                {line.tokens.map((token, tIdx) => {
                  if (tIdx < currentTokenIdx || !isCurrentLine) {
                    return (
                      <span key={tIdx} className={tokenStyles[token.type] || 'text-zinc-300'}>
                        {token.text}
                      </span>
                    );
                  }
                  if (tIdx === currentTokenIdx && isCurrentLine) {
                    return (
                      <span key={tIdx} className={tokenStyles[token.type] || 'text-zinc-300'}>
                        {token.text.substring(0, currentCharIdx)}
                      </span>
                    );
                  }
                  return null;
                })}
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
