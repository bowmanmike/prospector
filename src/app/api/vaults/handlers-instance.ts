import { Database, getDatabase } from "@/lib/database";
import { createVaultHandlers, VaultHandlers } from "./handlers";

// Singleton for pre-initialized handlers with lazy initialization
let vaultHandlersInstance: VaultHandlers | null = null;
let initializationPromise: Promise<VaultHandlers> | null = null;

// For production - lazy initialization on first access
export async function getVaultHandlers(): Promise<VaultHandlers> {
  if (vaultHandlersInstance) {
    return vaultHandlersInstance;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = initializeFromDatabase();
  return initializationPromise;
}

async function initializeFromDatabase(): Promise<VaultHandlers> {
  try {
    console.log("Initializing vault handlers...");
    const db = await getDatabase();
    vaultHandlersInstance = createVaultHandlers(db);
    console.log("Vault handlers initialized successfully");
    return vaultHandlersInstance;
  } catch (error) {
    console.error("Failed to initialize vault handlers:", error);
    // Reset so we can retry
    initializationPromise = null;
    throw error;
  }
}

// For testing - explicit initialization with test database
export function initializeVaultHandlers(db: Database): VaultHandlers {
  console.log("Initializing vault handlers...");
  vaultHandlersInstance = createVaultHandlers(db);
  initializationPromise = Promise.resolve(vaultHandlersInstance);
  console.log("Vault handlers initialized successfully");
  return vaultHandlersInstance;
}

// For testing - reset the instance
export function resetVaultHandlers(): void {
  vaultHandlersInstance = null;
  initializationPromise = null;
}