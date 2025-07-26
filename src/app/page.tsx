"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  createVault,
  deleteVault,
  getVaults,
} from "@/app/actions/vault-actions";
import type { Vault } from "@/lib/database/types";

export default function Home() {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [isValidVault, setIsValidVault] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExistingVaults = useCallback(async () => {
    try {
      const result = await getVaults();
      if (result.success && result.data.length > 0) {
        // For now, use the first vault (we can add vault selection later)
        const vault = result.data[0];
        setSelectedVault(vault);
        setIsValidVault(true); // Vaults in DB are assumed valid
      }
    } catch (error) {
      console.error("Error loading existing vaults:", error);
      setError("Failed to load existing vaults");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExistingVaults();
  }, [loadExistingVaults]);

  const handleDirectorySelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const pathParts = firstFile.webkitRelativePath.split("/");
      const directoryPath = pathParts[0];

      // Basic validation for Obsidian vault
      const hasObsidianFolder = Array.from(files).some((file) =>
        file.webkitRelativePath.includes("/.obsidian/"),
      );

      setIsValidVault(hasObsidianFolder);

      if (hasObsidianFolder) {
        // Save vault metadata to SQLite via Server Action
        startTransition(async () => {
          try {
            setError("");
            const result = await createVault({
              name: directoryPath,
              path: directoryPath, // For now, using directory name as path
            });

            if (result.success) {
              setSelectedVault(result.data);
              // TODO: Still need to handle file storage separately for immediate access
            }
          } catch (error) {
            console.error("Error saving vault:", error);
            setError(
              error instanceof Error ? error.message : "Failed to save vault",
            );
          }
        });
      }
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearVault = () => {
    if (!selectedVault) return;

    startTransition(async () => {
      try {
        setError("");
        await deleteVault(selectedVault.id);
        setSelectedVault(null);
        setIsValidVault(null);
      } catch (error) {
        console.error("Error clearing vault:", error);
        setError(
          error instanceof Error ? error.message : "Failed to clear vault",
        );
      }
    });
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
              {selectedVault
                ? "Your vault is connected and ready to use"
                : "Select your Obsidian vault directory to get started"}
            </p>
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-muted-foreground">
                Loading existing vaults...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                {...({
                  webkitdirectory: "true",
                } as React.InputHTMLAttributes<HTMLInputElement>)}
                multiple
                className="hidden"
                onChange={handleDirectorySelect}
              />

              {!selectedVault ? (
                <>
                  <button
                    type="button"
                    onClick={handleSelectClick}
                    disabled={isPending}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {isPending ? "Saving..." : "Select Vault Directory"}
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
                        {selectedVault.name}
                      </code>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Path: {selectedVault.path}
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
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                      Change Vault
                    </button>
                    <button
                      type="button"
                      onClick={handleClearVault}
                      disabled={isPending}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {isPending ? "Removing..." : "Clear Vault"}
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
