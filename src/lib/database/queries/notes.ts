import type { Database } from "../index";
import type { CreateNoteInput, Note, UpdateNoteInput } from "../types";

export class NoteQueries {
  constructor(private db: Database) {}

  async create(input: CreateNoteInput): Promise<Note> {
    const result = await this.db.run(
      `INSERT INTO notes (
        vault_id, file_path, file_name, file_size, modified_time, created_time,
        content_hash, title, frontmatter_tags, frontmatter_data, word_count, character_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.vault_id,
        input.file_path,
        input.file_name,
        input.file_size || null,
        input.modified_time || null,
        input.created_time || null,
        input.content_hash || null,
        input.title || null,
        input.frontmatter_tags ? JSON.stringify(input.frontmatter_tags) : null,
        input.frontmatter_data ? JSON.stringify(input.frontmatter_data) : null,
        input.word_count || null,
        input.character_count || null,
      ],
    );

    const note = await this.db.get<Note>(`SELECT * FROM notes WHERE id = ?`, [
      result.lastID,
    ]);

    if (!note) {
      throw new Error("Failed to create note");
    }

    return note;
  }

  async getById(id: number): Promise<Note | null> {
    const note = await this.db.get<Note>(`SELECT * FROM notes WHERE id = ?`, [
      id,
    ]);

    return note || null;
  }

  async getByPath(vaultId: number, filePath: string): Promise<Note | null> {
    const note = await this.db.get<Note>(
      `SELECT * FROM notes WHERE vault_id = ? AND file_path = ?`,
      [vaultId, filePath],
    );

    return note || null;
  }

  async getByVault(vaultId: number): Promise<Note[]> {
    return this.db.all<Note>(
      `SELECT * FROM notes WHERE vault_id = ? ORDER BY modified_time DESC`,
      [vaultId],
    );
  }

  async update(id: number, input: UpdateNoteInput): Promise<Note> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.file_size !== undefined) {
      updates.push("file_size = ?");
      values.push(input.file_size);
    }
    if (input.modified_time !== undefined) {
      updates.push("modified_time = ?");
      values.push(input.modified_time);
    }
    if (input.content_hash !== undefined) {
      updates.push("content_hash = ?");
      values.push(input.content_hash);
    }
    if (input.title !== undefined) {
      updates.push("title = ?");
      values.push(input.title);
    }
    if (input.frontmatter_tags !== undefined) {
      updates.push("frontmatter_tags = ?");
      values.push(JSON.stringify(input.frontmatter_tags));
    }
    if (input.frontmatter_data !== undefined) {
      updates.push("frontmatter_data = ?");
      values.push(JSON.stringify(input.frontmatter_data));
    }
    if (input.word_count !== undefined) {
      updates.push("word_count = ?");
      values.push(input.word_count);
    }
    if (input.character_count !== undefined) {
      updates.push("character_count = ?");
      values.push(input.character_count);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    await this.db.run(
      `UPDATE notes SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const note = await this.getById(id);
    if (!note) {
      throw new Error("Failed to update note");
    }

    return note;
  }

  async delete(id: number): Promise<void> {
    await this.db.run(`DELETE FROM notes WHERE id = ?`, [id]);
  }

  async deleteByPath(vaultId: number, filePath: string): Promise<void> {
    await this.db.run(
      `DELETE FROM notes WHERE vault_id = ? AND file_path = ?`,
      [vaultId, filePath],
    );
  }

  async getModifiedSince(vaultId: number, since: string): Promise<Note[]> {
    return this.db.all<Note>(
      `SELECT * FROM notes 
       WHERE vault_id = ? AND modified_time > ? 
       ORDER BY modified_time DESC`,
      [vaultId, since],
    );
  }

  async search(vaultId: number, query: string): Promise<Note[]> {
    const searchTerm = `%${query}%`;
    return this.db.all<Note>(
      `SELECT * FROM notes 
       WHERE vault_id = ? 
       AND (title LIKE ? OR file_name LIKE ? OR frontmatter_data LIKE ?)
       ORDER BY modified_time DESC`,
      [vaultId, searchTerm, searchTerm, searchTerm],
    );
  }
}
