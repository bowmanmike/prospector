import type { Database } from "../index";
import type { CreateVaultInput, Vault, VaultStatistics } from "../types";

export class VaultQueries {
  constructor(private db: Database) {}

  async create(input: CreateVaultInput): Promise<Vault> {
    const result = await this.db.run(
      `INSERT INTO vaults (path, name) VALUES (?, ?)`,
      [input.path, input.name],
    );

    const vault = await this.db.get<Vault>(
      `SELECT * FROM vaults WHERE id = ?`,
      [result.lastID],
    );

    if (!vault) {
      throw new Error("Failed to create vault");
    }

    return vault;
  }

  async getByPath(path: string): Promise<Vault | null> {
    const vault = await this.db.get<Vault>(
      `SELECT * FROM vaults WHERE path = ?`,
      [path],
    );

    return vault || null;
  }

  async getById(id: number): Promise<Vault | null> {
    const vault = await this.db.get<Vault>(
      `SELECT * FROM vaults WHERE id = ?`,
      [id],
    );

    return vault || null;
  }

  async getAll(): Promise<Vault[]> {
    return this.db.all<Vault>(`SELECT * FROM vaults ORDER BY created_at DESC`);
  }

  async updateLastScanned(id: number): Promise<void> {
    await this.db.run(
      `UPDATE vaults SET last_scanned = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run(`DELETE FROM vaults WHERE id = ?`, [id]);
  }

  async getStatistics(vaultId: number): Promise<VaultStatistics> {
    const stats = await this.db.get<VaultStatistics>(
      `SELECT 
        COUNT(*) as note_count,
        COALESCE(SUM(word_count), 0) as total_words,
        COALESCE(SUM(character_count), 0) as total_characters,
        MAX(modified_time) as last_modified
      FROM notes 
      WHERE vault_id = ?`,
      [vaultId],
    );

    const tagCount = await this.db.get<{ tag_count: number }>(
      `SELECT COUNT(*) as tag_count FROM tags WHERE vault_id = ?`,
      [vaultId],
    );

    return {
      note_count: stats?.note_count || 0,
      tag_count: tagCount?.tag_count || 0,
      total_words: stats?.total_words || 0,
      total_characters: stats?.total_characters || 0,
      last_modified: stats?.last_modified || null,
    };
  }
}
