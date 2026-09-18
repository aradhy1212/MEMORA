import React, { useState } from 'react';
import { 
  Bot, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown
} from 'lucide-react';
import { MemoryUpdateCard } from './MemoryUpdateCard';
import { MemoryEvidence } from './MemoryEvidence';

export const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Helper to format simple markdown (bolding, code blocks, lists)
   */
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bullet list items
      if (line.startsWith('- ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc marker:text-orange-500 my-0.5">
            {formatInlineText(content)}
          </li>
        );
      }
      
      // Numbered list items
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^\d+\.\s/);
        const content = line.substring(match[0].length);
        return (
          <li key={idx} className="ml-4 list-decimal marker:text-orange-500 my-0.5">
            {formatInlineText(content)}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="my-0.5">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  /**
   * Format **bold**, `code`, and *italic*
   */
  const formatInlineText = (str) => {
    const parts = [];
    let remaining = str;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      let firstMatch = null;
      let matchType = null;

      if (boldMatch && (!codeMatch || boldMatch.index < codeMatch.index)) {
        firstMatch = boldMatch;
        matchType = 'bold';
      } else if (codeMatch) {
        firstMatch = codeMatch;
        matchType = 'code';
      }

      if (firstMatch) {
        if (firstMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, firstMatch.index)}</span>);
        }

        if (matchType === 'bold') {
          parts.push(
            <strong key={key++} className="font-bold text-stone-950 dark:text-white">
              {firstMatch[1]}
            </strong>
          );
        } else if (matchType === 'code') {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 rounded-md bg-[#f4ede0] dark:bg-[#1a1820] text-orange-800 dark:text-orange-300 font-mono text-xs border border-[#decbb8] dark:border-orange-500/25 font-semibold">
              {firstMatch[1]}
            </code>
          );
        }

        remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  return (
    <div className={`flex gap-3 my-4 animate-fade-in ${isUser ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-orange-500/20">
            RS
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className={`max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header with name and timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-500">
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {isUser ? 'Rahul' : 'MEMORA'}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-colors ${
            isUser
              ? 'bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-white rounded-tr-sm shadow-md shadow-orange-500/20 font-medium'
              : 'bg-[#fffdfa] dark:bg-[#16161d] text-stone-900 dark:text-stone-200 border border-[#e8dccb] dark:border-white/10 rounded-tl-sm shadow-sm'
          }`}
        >
          <div className="space-y-1">
            {renderFormattedText(message.text)}
          </div>
        </div>

        {/* Inline Memory Evolution / Creation Card */}
        {message.memoryEvent && (
          <MemoryUpdateCard event={message.memoryEvent} />
        )}

        {/* Explainability / "Why did I say this?" */}
        {message.evidence && (
          <MemoryEvidence evidence={message.evidence} />
        )}

        {/* Assistant Footer Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 px-1 text-stone-500">
            <button
              onClick={handleCopy}
              className="p-1 hover:text-orange-600 rounded hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              className="p-1 hover:text-orange-600 rounded hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
              title="Helpful response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 hover:text-orange-600 rounded hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
              title="Needs improvement"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
