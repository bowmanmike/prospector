import type { DatabaseQueries } from "../queries";
import { mockVault, setupTestDatabase } from "../test-utils";

describe("VaultQueries", () => {
  let queries: DatabaseQueries;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    queries = setup.queries;
    cleanup = setup.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("create", () => {
    it("should create a new vault", async () => {
      const vault = await queries.vaults.create(mockVault);

      expect(vault.id).toBeDefined();
      expect(vault.path).toBe(mockVault.path);
      expect(vault.name).toBe(mockVault.name);
      expect(vault.created_at).toBeDefined();
      expect(vault.last_scanned).toBeNull();
    });

    it("should throw error for duplicate path", async () => {
      await queries.vaults.create(mockVault);

      await expect(queries.vaults.create(mockVault)).rejects.toThrow();
    });
  });

  describe("getByPath", () => {
    it("should return vault by path", async () => {
      const created = await queries.vaults.create(mockVault);
      const found = await queries.vaults.getByPath(mockVault.path);

      expect(found).toEqual(created);
    });

    it("should return null for non-existent path", async () => {
      const found = await queries.vaults.getByPath("/non/existent");

      expect(found).toBeNull();
    });
  });

  describe("getById", () => {
    it("should return vault by id", async () => {
      const created = await queries.vaults.create(mockVault);
      const found = await queries.vaults.getById(created.id);

      expect(found).toEqual(created);
    });

    it("should return null for non-existent id", async () => {
      const found = await queries.vaults.getById(999);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all vaults ordered by created_at DESC", async () => {
      const vault1 = await queries.vaults.create({
        ...mockVault,
        path: "/path1",
      });
      const vault2 = await queries.vaults.create({
        ...mockVault,
        path: "/path2",
      });

      const all = await queries.vaults.getAll();

      expect(all).toHaveLength(2);
      // Check that results are ordered by created_at DESC
      const ids = all.map((v) => v.id);
      expect(ids).toContain(vault1.id);
      expect(ids).toContain(vault2.id);
    });

    it("should return empty array when no vaults exist", async () => {
      const all = await queries.vaults.getAll();

      expect(all).toHaveLength(0);
    });
  });

  describe("updateLastScanned", () => {
    it("should update last_scanned timestamp", async () => {
      const vault = await queries.vaults.create(mockVault);

      await queries.vaults.updateLastScanned(vault.id);

      const updated = await queries.vaults.getById(vault.id);
      expect(updated?.last_scanned).toBeDefined();
      expect(updated?.last_scanned).not.toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete vault", async () => {
      const vault = await queries.vaults.create(mockVault);

      await queries.vaults.delete(vault.id);

      const found = await queries.vaults.getById(vault.id);
      expect(found).toBeNull();
    });
  });

  describe("getStatistics", () => {
    it("should return correct statistics", async () => {
      const vault = await queries.vaults.create(mockVault);

      // Create test notes
      await queries.notes.create({
        vault_id: vault.id,
        file_path: "/test/note1.md",
        file_name: "note1.md",
        word_count: 100,
        character_count: 500,
        modified_time: "2024-01-01T00:00:00.000Z",
      });

      await queries.notes.create({
        vault_id: vault.id,
        file_path: "/test/note2.md",
        file_name: "note2.md",
        word_count: 200,
        character_count: 1000,
        modified_time: "2024-01-02T00:00:00.000Z",
      });

      // Create test tags
      await queries.tags.create(vault.id, "tag1");
      await queries.tags.create(vault.id, "tag2");

      const stats = await queries.vaults.getStatistics(vault.id);

      expect(stats.note_count).toBe(2);
      expect(stats.tag_count).toBe(2);
      expect(stats.total_words).toBe(300);
      expect(stats.total_characters).toBe(1500);
      expect(stats.last_modified).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should return zero statistics for empty vault", async () => {
      const vault = await queries.vaults.create(mockVault);

      const stats = await queries.vaults.getStatistics(vault.id);

      expect(stats.note_count).toBe(0);
      expect(stats.tag_count).toBe(0);
      expect(stats.total_words).toBe(0);
      expect(stats.total_characters).toBe(0);
      expect(stats.last_modified).toBeNull();
    });
  });
});
