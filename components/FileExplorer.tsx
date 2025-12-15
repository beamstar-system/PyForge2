import React, { useMemo } from 'react';
import { GeneratedFile } from '../types';
import { FileIcon, FolderIcon, FileTextIcon, FileCodeIcon, BoxIcon } from 'lucide-react';

interface FileExplorerProps {
  files: GeneratedFile[];
  selectedFile: GeneratedFile | null;
  onSelectFile: (file: GeneratedFile) => void;
  projectName: string;
}

// Helper to determine icon based on extension
const getFileIcon = (path: string) => {
  if (path.endsWith('.py')) return <FileCodeIcon size={16} className="text-blue-400" />;
  if (path.endsWith('.md')) return <FileTextIcon size={16} className="text-gray-400" />;
  if (path.endsWith('.json')) return <FileCodeIcon size={16} className="text-yellow-400" />;
  if (path.includes('requirements.txt') || path.includes('Dockerfile')) return <BoxIcon size={16} className="text-orange-400" />;
  return <FileIcon size={16} className="text-gray-500" />;
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  selectedFile, 
  onSelectFile,
  projectName
}) => {
  
  // Sort files: root files first, then by path length (naive folder clustering)
  // A real implementation might build a proper tree, but a flat sorted list with indent is okay for MVP
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => a.path.localeCompare(b.path));
  }, [files]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 bg-gray-850">
        <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2 truncate">
          <FolderIcon size={16} className="text-blue-500" />
          {projectName || "Project"}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {sortedFiles.length === 0 ? (
          <div className="text-xs text-gray-600 p-4 text-center italic">
            No files generated yet.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {sortedFiles.map((file) => {
              const isActive = selectedFile?.path === file.path;
              // Simple indent based on slashes
              const depth = (file.path.match(/\//g) || []).length;
              
              return (
                <li key={file.path}>
                  <button
                    onClick={() => onSelectFile(file)}
                    className={`w-full text-left flex items-center gap-2 py-1.5 px-3 hover:bg-gray-800 transition-colors ${
                      isActive ? 'bg-blue-900/30 text-blue-300 border-l-2 border-blue-500' : 'text-gray-400 border-l-2 border-transparent'
                    }`}
                    style={{ paddingLeft: `${(depth * 12) + 12}px` }}
                  >
                    {getFileIcon(file.path)}
                    <span className="text-xs font-mono truncate">{file.path.split('/').pop()}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};