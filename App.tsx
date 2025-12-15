import React, { useState, useRef } from 'react';
import { generateCodebase } from './services/geminiService';
import { GeneratedProject, GeneratedFile, LoadingState, GenerationConfig } from './types';
import { FileExplorer } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';
import { DEFAULT_MODEL, FALLBACK_MODEL, APP_NAME } from './constants';
import { TerminalIcon, SparklesIcon, Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Config State
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [includeTests, setIncludeTests] = useState(true);
  const [includeDocker, setIncludeDocker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setProject(null);
    setSelectedFile(null);

    try {
      const config: GenerationConfig = {
        model,
        includeTests,
        includeDocker
      };
      
      const result = await generateCodebase(prompt, config);
      setProject(result);
      if (result.files.length > 0) {
        // Try to select README.md first, or main.py, else the first file
        const readme = result.files.find(f => f.path.toLowerCase().includes('readme'));
        const main = result.files.find(f => f.path.toLowerCase().includes('main'));
        setSelectedFile(readme || main || result.files[0]);
      }
      setLoadingState(LoadingState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate codebase. Please try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/50">
            <TerminalIcon size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">{APP_NAME}</h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
           <span>Model:</span>
           <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-gray-800 border-none text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer"
           >
             <option value={DEFAULT_MODEL}>Gemini 3.0 Pro (Best Quality)</option>
             <option value={FALLBACK_MODEL}>Gemini 2.5 Flash (Fastest)</option>
           </select>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Generator Form & Project Info */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 z-20">
            <div className="p-6 border-b border-gray-800">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your Python app (e.g., 'A Flask API for a Todo list with SQLite and JWT auth')"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={includeTests}
                      onChange={(e) => setIncludeTests(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" 
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">Include Unit Tests</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={includeDocker}
                      onChange={(e) => setIncludeDocker(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" 
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">Include Dockerfile</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loadingState === LoadingState.GENERATING || !prompt.trim()}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-all ${
                    loadingState === LoadingState.GENERATING || !prompt.trim()
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                  }`}
                >
                  {loadingState === LoadingState.GENERATING ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon size={18} />
                      <span>Generate Codebase</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Description Area */}
            {project && (
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Project Summary
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="p-4 m-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}
        </div>

        {/* Center - File Tree (Only visible if project exists) */}
        {project && (
          <FileExplorer 
            files={project.files} 
            selectedFile={selectedFile} 
            onSelectFile={setSelectedFile} 
            projectName={project.projectName}
          />
        )}

        {/* Right - Code Viewer */}
        <CodeViewer file={selectedFile} />

      </main>
    </div>
  );
};

export default App;