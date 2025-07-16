import { setupTestDatabase, mockVault, mockNote } from "./test-utils";
import { DatabaseQueries } from "../queries";

describe("DatabaseQueries Transaction Support", () => {
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

  describe("transaction", () => {
    it("should commit successful transaction", async () => {
      const result = await queries.transaction(async (tx) => {
        const vault = await tx.vaults.create(mockVault);
        const note = await tx.notes.create({ ...mockNote, vault_id: vault.id });
        const tag = await tx.tags.create(vault.id, "test-tag");
        await tx.tags.linkToNote(note.id, tag.id);
        
        return { vault, note, tag };
      });

      // Verify all operations were committed
      const vault = await queries.vaults.getById(result.vault.id);
      const note = await queries.notes.getById(result.note.id);
      const tag = await queries.tags.getById(result.tag.id);
      const noteTags = await queries.tags.getTagsForNote(result.note.id);

      expect(vault).toBeDefined();
      expect(note).toBeDefined();
      expect(tag).toBeDefined();
      expect(noteTags).toHaveLength(1);
    });

    it("should rollback failed transaction", async () => {
      let vaultId: number;

      try {
        await queries.transaction(async (tx) => {
          const vault = await tx.vaults.create(mockVault);
          vaultId = vault.id;
          
          const note = await tx.notes.create({ ...mockNote, vault_id: vault.id });
          
          // This should cause an error (duplicate path)
          await tx.notes.create({ ...mockNote, vault_id: vault.id });
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify rollback - vault should not exist
      const vault = await queries.vaults.getById(vaultId!);
      expect(vault).toBeNull();
    });

    it("should rollback on thrown error", async () => {
      let vaultId: number;

      try {
        await queries.transaction(async (tx) => {
          const vault = await tx.vaults.create(mockVault);
          vaultId = vault.id;
          
          await tx.notes.create({ ...mockNote, vault_id: vault.id });
          
          // Throw custom error
          throw new Error("Custom transaction error");
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Custom transaction error");
      }

      // Verify rollback
      const vault = await queries.vaults.getById(vaultId!);
      expect(vault).toBeNull();
    });

    it("should handle nested operations in transaction", async () => {
      const result = await queries.transaction(async (tx) => {
        const vault = await tx.vaults.create(mockVault);
        
        // Create multiple notes
        const notes = await Promise.all([
          tx.notes.create({ ...mockNote, vault_id: vault.id, file_path: "/test/note1.md" }),
          tx.notes.create({ ...mockNote, vault_id: vault.id, file_path: "/test/note2.md" }),
          tx.notes.create({ ...mockNote, vault_id: vault.id, file_path: "/test/note3.md" }),
        ]);

        // Create tags and link them
        const tags = await Promise.all([
          tx.tags.create(vault.id, "tag1"),
          tx.tags.create(vault.id, "tag2"),
        ]);

        // Link tags to notes
        for (const note of notes) {
          for (const tag of tags) {
            await tx.tags.linkToNote(note.id, tag.id);
          }
        }

        await tx.tags.updateAllUsageCounts(vault.id);

        return { vault, notes, tags };
      });

      // Verify all operations were committed
      const vault = await queries.vaults.getById(result.vault.id);
      const notes = await queries.notes.getByVault(result.vault.id);
      const tags = await queries.tags.getByVault(result.vault.id);

      expect(vault).toBeDefined();
      expect(notes).toHaveLength(3);
      expect(tags).toHaveLength(2);
      
      // Each tag should be linked to 3 notes
      for (const tag of tags) {
        const updatedTag = await queries.tags.getById(tag.id);
        expect(updatedTag?.usage_count).toBe(3);
      }
    });

    it("should handle vault statistics calculation in transaction", async () => {
      const result = await queries.transaction(async (tx) => {
        const vault = await tx.vaults.create(mockVault);
        
        // Create notes with word counts
        await tx.notes.create({
          ...mockNote,
          vault_id: vault.id,
          file_path: "/test/note1.md",
          word_count: 100,
          character_count: 500,
        });
        
        await tx.notes.create({
          ...mockNote,
          vault_id: vault.id,
          file_path: "/test/note2.md", 
          word_count: 200,
          character_count: 1000,
        });

        // Create tags
        await tx.tags.create(vault.id, "tag1");
        await tx.tags.create(vault.id, "tag2");

        const stats = await tx.vaults.getStatistics(vault.id);
        return { vault, stats };
      });

      // Verify statistics were calculated correctly within transaction
      expect(result.stats.note_count).toBe(2);
      expect(result.stats.tag_count).toBe(2);
      expect(result.stats.total_words).toBe(300);
      expect(result.stats.total_characters).toBe(1500);
    });

    it("should return transaction result", async () => {
      const customResult = { success: true, message: "Transaction completed" };
      
      const result = await queries.transaction(async (tx) => {
        await tx.vaults.create(mockVault);
        return customResult;
      });

      expect(result).toEqual(customResult);
    });
  });
});