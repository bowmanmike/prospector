import { VaultHandlers } from "../handlers";
import { initializeVaultHandlers, resetVaultHandlers } from "../handlers-instance";
import { setupTestDatabase, mockVault } from "@/lib/database/__tests__/test-utils";

describe("Vault handlers (business logic)", () => {
  let handlers: VaultHandlers;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    cleanup = setup.cleanup;
    
    // Initialize handlers with test database
    handlers = initializeVaultHandlers(setup.db);
  });

  afterEach(async () => {
    resetVaultHandlers();
    if (cleanup) {
      await cleanup();
    }
  });

  describe("getAll", () => {
    it("should return empty array when no vaults exist", async () => {
      const vaults = await handlers.getAll();
      expect(vaults).toEqual([]);
    });

    it("should return all vaults when they exist", async () => {
      await handlers.create(mockVault);
      
      const vaults = await handlers.getAll();
      expect(vaults).toHaveLength(1);
      expect(vaults[0]).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
    });
  });

  describe("create", () => {
    it("should create a new vault successfully", async () => {
      const vault = await handlers.create(mockVault);
      
      expect(vault).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(vault).toHaveProperty("id");
      expect(vault).toHaveProperty("created_at");
      expect(vault.last_scanned).toBeNull();
    });

    it("should throw error for missing path", async () => {
      const invalidVault = { name: "Test Vault" } as any;
      
      await expect(handlers.create(invalidVault)).rejects.toThrow(
        "Both 'path' and 'name' are required"
      );
    });

    it("should throw error for missing name", async () => {
      const invalidVault = { path: "/test/vault" } as any;
      
      await expect(handlers.create(invalidVault)).rejects.toThrow(
        "Both 'path' and 'name' are required"
      );
    });

    it("should throw error for duplicate vault paths", async () => {
      await handlers.create(mockVault);
      
      const duplicateVault = { ...mockVault, name: "Different Name" };
      
      await expect(handlers.create(duplicateVault)).rejects.toThrow(
        `A vault with path '${mockVault.path}' already exists`
      );
    });
  });

  describe("getWithStats", () => {
    let vaultId: number;

    beforeEach(async () => {
      const vault = await handlers.create(mockVault);
      vaultId = vault.id;
    });

    it("should return vault with statistics", async () => {
      const vaultWithStats = await handlers.getWithStats(vaultId);
      
      expect(vaultWithStats).toMatchObject({
        id: vaultId,
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(vaultWithStats.statistics).toEqual({
        note_count: 0,
        tag_count: 0,
        total_words: 0,
        total_characters: 0,
        last_modified: null,
      });
    });

    it("should throw error for non-existent vault", async () => {
      await expect(handlers.getWithStats(999)).rejects.toThrow(
        "No vault found with ID 999"
      );
    });
  });

  describe("delete", () => {
    let vaultId: number;

    beforeEach(async () => {
      const vault = await handlers.create(mockVault);
      vaultId = vault.id;
    });

    it("should delete vault successfully", async () => {
      await handlers.delete(vaultId);
      
      // Verify vault is actually deleted
      await expect(handlers.getWithStats(vaultId)).rejects.toThrow(
        `No vault found with ID ${vaultId}`
      );
    });

    it("should throw error for non-existent vault", async () => {
      await expect(handlers.delete(999)).rejects.toThrow(
        "No vault found with ID 999"
      );
    });
  });
});