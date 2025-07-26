import { mockVault, setupTestDatabase } from "@/lib/database/test-utils";
import {
  initializeVaultHandlers,
  resetVaultHandlers,
} from "@/lib/handlers/vault-handlers";
import {
  createVault,
  deleteVault,
  getVaults,
  getVaultWithStats,
} from "../vault-actions";

describe("Vault Server Actions", () => {
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    cleanup = setup.cleanup;

    // Initialize handlers with test database
    initializeVaultHandlers(setup.db);
  });

  afterEach(async () => {
    resetVaultHandlers();
    if (cleanup) {
      await cleanup();
    }
  });

  describe("createVault", () => {
    it("should create vault successfully", async () => {
      const result = await createVault(mockVault);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(result.data).toHaveProperty("id");
      expect(result.data).toHaveProperty("created_at");
    });

    it("should throw error for duplicate vault path", async () => {
      await createVault(mockVault);

      const duplicateVault = { ...mockVault, name: "Different Name" };

      await expect(createVault(duplicateVault)).rejects.toThrow(
        `A vault with path '${mockVault.path}' already exists`,
      );
    });
  });

  describe("getVaults", () => {
    it("should return empty array when no vaults exist", async () => {
      const result = await getVaults();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should return array of vaults when they exist", async () => {
      await createVault(mockVault);

      const result = await getVaults();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
    });
  });

  describe("getVaultWithStats", () => {
    it("should return vault with statistics", async () => {
      const created = await createVault(mockVault);
      const vaultId = created.data.id;

      const result = await getVaultWithStats(vaultId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: vaultId,
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(result.data.statistics).toEqual({
        note_count: 0,
        tag_count: 0,
        total_words: 0,
        total_characters: 0,
        last_modified: null,
      });
    });

    it("should throw error for non-existent vault", async () => {
      await expect(getVaultWithStats(999)).rejects.toThrow(
        "No vault found with ID 999",
      );
    });
  });

  describe("deleteVault", () => {
    it("should delete vault successfully", async () => {
      const created = await createVault(mockVault);
      const vaultId = created.data.id;

      const result = await deleteVault(vaultId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ deleted: true });

      // Verify vault is actually deleted
      await expect(getVaultWithStats(vaultId)).rejects.toThrow(
        `No vault found with ID ${vaultId}`,
      );
    });

    it("should throw error for non-existent vault", async () => {
      await expect(deleteVault(999)).rejects.toThrow(
        "No vault found with ID 999",
      );
    });
  });
});
