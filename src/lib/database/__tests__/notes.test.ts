import { setupTestDatabase, mockVault, mockNote } from "./test-utils";
import { DatabaseQueries } from "../queries";

describe("NoteQueries", () => {
  let queries: DatabaseQueries;
  let cleanup: () => Promise<void>;
  let vaultId: number;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    queries = setup.queries;
    cleanup = setup.cleanup;
    
    // Create a test vault
    const vault = await queries.vaults.create(mockVault);
    vaultId = vault.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("create", () => {
    it("should create a new note with all fields", async () => {
      const noteInput = { ...mockNote, vault_id: vaultId };
      const note = await queries.notes.create(noteInput);

      expect(note.id).toBeDefined();
      expect(note.vault_id).toBe(vaultId);
      expect(note.file_path).toBe(mockNote.file_path);
      expect(note.file_name).toBe(mockNote.file_name);
      expect(note.file_size).toBe(mockNote.file_size);
      expect(note.title).toBe(mockNote.title);
      expect(note.word_count).toBe(mockNote.word_count);
      expect(note.character_count).toBe(mockNote.character_count);
      expect(note.frontmatter_tags).toBe(JSON.stringify(mockNote.frontmatter_tags));
      expect(note.frontmatter_data).toBe(JSON.stringify(mockNote.frontmatter_data));
    });

    it("should create a note with minimal fields", async () => {
      const noteInput = {
        vault_id: vaultId,
        file_path: "/test/minimal.md",
        file_name: "minimal.md",
      };
      
      const note = await queries.notes.create(noteInput);

      expect(note.id).toBeDefined();
      expect(note.vault_id).toBe(vaultId);
      expect(note.file_path).toBe(noteInput.file_path);
      expect(note.file_name).toBe(noteInput.file_name);
      expect(note.file_size).toBeNull();
      expect(note.title).toBeNull();
      expect(note.frontmatter_tags).toBeNull();
      expect(note.frontmatter_data).toBeNull();
    });

    it("should throw error for duplicate path in same vault", async () => {
      const noteInput = { ...mockNote, vault_id: vaultId };
      await queries.notes.create(noteInput);
      
      await expect(queries.notes.create(noteInput)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("should return note by id", async () => {
      const created = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      const found = await queries.notes.getById(created.id);

      expect(found).toEqual(created);
    });

    it("should return null for non-existent id", async () => {
      const found = await queries.notes.getById(999);

      expect(found).toBeNull();
    });
  });

  describe("getByPath", () => {
    it("should return note by vault id and file path", async () => {
      const created = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      const found = await queries.notes.getByPath(vaultId, mockNote.file_path);

      expect(found).toEqual(created);
    });

    it("should return null for non-existent path", async () => {
      const found = await queries.notes.getByPath(vaultId, "/non/existent.md");

      expect(found).toBeNull();
    });
  });

  describe("getByVault", () => {
    it("should return all notes for a vault ordered by modified_time DESC", async () => {
      const note1 = await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/note1.md",
        modified_time: "2024-01-01T00:00:00.000Z",
      });
      
      const note2 = await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/note2.md",
        modified_time: "2024-01-02T00:00:00.000Z",
      });

      const notes = await queries.notes.getByVault(vaultId);

      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe(note2.id); // More recent first
      expect(notes[1].id).toBe(note1.id);
    });

    it("should return empty array for vault with no notes", async () => {
      const notes = await queries.notes.getByVault(vaultId);

      expect(notes).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update note fields", async () => {
      const note = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      
      const updateData = {
        title: "Updated Title",
        word_count: 200,
        frontmatter_tags: ["new-tag"],
        frontmatter_data: { updated: true },
      };

      const updated = await queries.notes.update(note.id, updateData);

      expect(updated.title).toBe(updateData.title);
      expect(updated.word_count).toBe(updateData.word_count);
      expect(updated.frontmatter_tags).toBe(JSON.stringify(updateData.frontmatter_tags));
      expect(updated.frontmatter_data).toBe(JSON.stringify(updateData.frontmatter_data));
    });

    it("should throw error when no fields to update", async () => {
      const note = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      
      await expect(queries.notes.update(note.id, {})).rejects.toThrow("No fields to update");
    });

    it("should throw error for non-existent note", async () => {
      await expect(queries.notes.update(999, { title: "Test" })).rejects.toThrow("Failed to update note");
    });
  });

  describe("delete", () => {
    it("should delete note by id", async () => {
      const note = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      
      await queries.notes.delete(note.id);
      
      const found = await queries.notes.getById(note.id);
      expect(found).toBeNull();
    });
  });

  describe("deleteByPath", () => {
    it("should delete note by vault id and path", async () => {
      const note = await queries.notes.create({ ...mockNote, vault_id: vaultId });
      
      await queries.notes.deleteByPath(vaultId, mockNote.file_path);
      
      const found = await queries.notes.getById(note.id);
      expect(found).toBeNull();
    });
  });

  describe("getModifiedSince", () => {
    it("should return notes modified after given timestamp", async () => {
      await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/old.md",
        modified_time: "2024-01-01T00:00:00.000Z",
      });
      
      const recent = await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/recent.md",
        modified_time: "2024-01-03T00:00:00.000Z",
      });

      const notes = await queries.notes.getModifiedSince(vaultId, "2024-01-02T00:00:00.000Z");

      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe(recent.id);
    });
  });

  describe("search", () => {
    it("should search notes by title, filename, and frontmatter", async () => {
      await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/searchable.md",
        file_name: "searchable.md",
        title: "Important Note",
        frontmatter_data: { category: "work", priority: "high" },
      });
      
      await queries.notes.create({
        ...mockNote,
        vault_id: vaultId,
        file_path: "/test/other.md",
        file_name: "other.md",
        title: "Random Note",
        frontmatter_data: { category: "personal" },
      });

      // Search by title
      const titleResults = await queries.notes.search(vaultId, "Important");
      expect(titleResults).toHaveLength(1);
      expect(titleResults[0].title).toBe("Important Note");

      // Search by filename
      const filenameResults = await queries.notes.search(vaultId, "searchable");
      expect(filenameResults).toHaveLength(1);
      expect(filenameResults[0].file_name).toBe("searchable.md");

      // Search by frontmatter
      const frontmatterResults = await queries.notes.search(vaultId, "work");
      expect(frontmatterResults).toHaveLength(1);
      expect(frontmatterResults[0].title).toBe("Important Note");

      // Search with no results
      const noResults = await queries.notes.search(vaultId, "nonexistent");
      expect(noResults).toHaveLength(0);
    });
  });
});