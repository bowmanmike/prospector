import { Database } from "@/lib/database";
import { VaultQueries } from "@/lib/database/queries/vaults";
import { Vault, VaultStatistics, CreateVaultInput } from "@/lib/database/types";

// Handler interface
// Does this need to be a separate file from the handlers-instance.ts?
export interface VaultHandlers {
  getAll(): Promise<Vault[]>;
  create(input: CreateVaultInput): Promise<Vault>;
  getWithStats(
    vaultId: number,
  ): Promise<Vault & { statistics: VaultStatistics }>;
  delete(vaultId: number): Promise<void>;
}

// Factory function to create handlers with bound database
export function createVaultHandlers(db: Database): VaultHandlers {
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

