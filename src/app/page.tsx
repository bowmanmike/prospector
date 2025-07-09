"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vaultStorage } from "@/lib/storage";

export default function Home() {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [isValidVault, setIsValidVault] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExistingVault = useCallback(async () => {
    try {
      const vaultSettings = await vaultStorage.getVaultSettings();
      if (vaultSettings) {
        setSelectedPath(vaultSettings.name);

        // Defer validation to avoid blocking the UI
        setTimeout(async () => {
          try {
            const isValid = await vaultStorage.isValidObsidianVault(
              vaultSettings.files,
            );
            setIsValidVault(isValid);
          } catch (error) {
            console.error("Error validating vault:", error);
            setIsValidVault(false);
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error loading existing vault:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExistingVault();
  }, [loadExistingVault]);

  const handleDirectorySelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const pathParts = firstFile.webkitRelativePath.split("/");
      const directoryPath = pathParts[0];

      setSelectedPath(directoryPath);

      // Basic validation for Obsidian vault
      const hasObsidianFolder = Array.from(files).some((file) =>
        file.webkitRelativePath.includes("/.obsidian/"),
      );

      setIsValidVault(hasObsidianFolder);

      // Save to IndexedDB for persistence
      await vaultStorage.saveVaultFiles(files, directoryPath);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearDirectory = async () => {
    try {
      await vaultStorage.clearVaultSettings();
      setSelectedPath("");
      setIsValidVault(null);
    } catch (error) {
      console.error("Error clearing directory:", error);
    }
  };

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
              {selectedPath
                ? "Your vault is connected and ready to use"
                : "Select your Obsidian vault directory to get started"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-muted-foreground">
                Loading existing vault...
              </span>
            </div>
          ) : (
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

              {!selectedPath ? (
                <>
                  <button
                    type="button"
                    onClick={handleSelectClick}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Select Vault Directory
                  </button>

                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your browser will request permission to access files. This
                    is required to read your vault.
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Connected:</span>
                      <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {selectedPath}
                      </code>
                    </div>

                    {isValidVault !== null && (
                      <div
                        className={`text-sm ${isValidVault ? "text-green-600" : "text-red-600"}`}
                      >
                        {isValidVault ? (
                          <span>✓ Valid Obsidian vault detected</span>
                        ) : (
                          <span>
                            ⚠ No .obsidian folder found - this may not be a
                            valid Obsidian vault
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleSelectClick}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Change Vault
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDirectory}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Clear Vault
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
