import { type Database, getDatabase } from "@/lib/database";
import { VaultQueries } from "@/lib/database/queries/vaults";
import type {
  CreateVaultInput,
  Vault,
  VaultStatistics,
} from "@/lib/database/types";

// Handler interface
export interface VaultHandlers {
  getAll(): Promise<Vault[]>;
  create(input: CreateVaultInput): Promise<Vault>;
  getWithStats(
    vaultId: number,
  ): Promise<Vault & { statistics: VaultStatistics }>;
  delete(vaultId: number): Promise<void>;
}

// Factory function to create handlers with bound database
function createVaultHandlers(db: Database): VaultHandlers {
  const vaultQueries = new VaultQueries(db);

  return {
    async getAll(): Promise<Vault[]> {
      return await vaultQueries.getAll();
    },

    async create(input: CreateVaultInput): Promise<Vault> {
      // Validation
      if (!input.path || !input.name) {
        throw new Error("Both 'path' and 'name' are required");
      }

      // Check if vault already exists
      const existingVault = await vaultQueries.getByPath(input.path);
      if (existingVault) {
        throw new Error(`A vault with path '${input.path}' already exists`);
      }

      return await vaultQueries.create(input);
    },

    async getWithStats(
      vaultId: number,
    ): Promise<Vault & { statistics: VaultStatistics }> {
      const vault = await vaultQueries.getById(vaultId);
      if (!vault) {
        throw new Error(`No vault found with ID ${vaultId}`);
      }

      const statistics = await vaultQueries.getStatistics(vaultId);

      return {
        ...vault,
        statistics,
      };
    },

    async delete(vaultId: number): Promise<void> {
      // Check if vault exists before deleting
      const vault = await vaultQueries.getById(vaultId);
      if (!vault) {
        throw new Error(`No vault found with ID ${vaultId}`);
      }

      await vaultQueries.delete(vaultId);
    },
  };
}

// Singleton instance management
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
