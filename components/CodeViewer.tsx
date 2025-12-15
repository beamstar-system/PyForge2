import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '../types';
import { CopyIcon, CheckIcon, DownloadIcon } from 'lucide-react';
import { INITIAL_CODE_PROMPT } from '../constants';

interface CodeViewerProps {
  file: GeneratedFile | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!file) return;
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const codeContent = file ? file.content : INITIAL_CODE_PROMPT;
  const fileName = file ? file.path : 'Welcome';

  return (
    <div className="flex flex-col h-full bg-gray-950 flex-1 min-w-0">
      {/* Header */}
      <div className="h-12 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-mono text-gray-400 truncate">{fileName}</span>
        
        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Download File"
            >
              <DownloadIcon size={16} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {copied ? <CheckIcon size={14} className="text-green-400" /> : <CopyIcon size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 overflow-auto p-0 relative group">
        <pre className="min-h-full p-4 font-mono text-sm leading-relaxed text-gray-300">
          <code>{codeContent}</code>
        </pre>
      </div>
    </div>
  );
};