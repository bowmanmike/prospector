"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [isValidVault, setIsValidVault] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectorySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const pathParts = firstFile.webkitRelativePath.split('/');
      const directoryPath = pathParts[0];
      
      setSelectedPath(directoryPath);
      
      // Basic validation for Obsidian vault
      const hasObsidianFolder = Array.from(files).some(file => 
        file.webkitRelativePath.includes('/.obsidian/')
      );
      
      setIsValidVault(hasObsidianFolder);
    }
  };

  const handleModernDirectorySelect = async () => {
    try {
      // Use File System Access API if available
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setSelectedPath(directoryHandle.name);
        
        // Check for .obsidian folder
        try {
          await directoryHandle.getDirectoryHandle('.obsidian');
          setIsValidVault(true);
        } catch {
          setIsValidVault(false);
        }
      } else {
        // Fallback to traditional file input
        fileInputRef.current?.click();
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Directory selection cancelled');
    }
  };

  const supportsModernAPI = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Prospector</h1>
          <p className="text-lg text-muted-foreground">
            AI-powered knowledge discovery for your Obsidian vault
          </p>
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Connect Your Vault</h2>
            <p className="text-muted-foreground">
              Select your Obsidian vault directory to get started
            </p>
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={handleDirectorySelect}
            />
            
            <button
              onClick={handleModernDirectorySelect}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Select Vault Directory
            </button>
            
            {!supportsModernAPI && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your browser will request permission to access files. This is required to read your vault.
              </p>
            )}

            {selectedPath && (
              <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Selected:</span>
                  <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {selectedPath}
                  </code>
                </div>
                
                {isValidVault !== null && (
                  <div className={`text-sm ${isValidVault ? 'text-green-600' : 'text-red-600'}`}>
                    {isValidVault ? (
                      <span>✓ Valid Obsidian vault detected</span>
                    ) : (
                      <span>⚠ No .obsidian folder found - this may not be a valid Obsidian vault</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
