import type { Database } from "../index";
import { NoteQueries } from "./notes";
import { TagQueries } from "./tags";
import { VaultQueries } from "./vaults";

export class DatabaseQueries {
  public vaults: VaultQueries;
  public notes: NoteQueries;
  public tags: TagQueries;

  constructor(private db: Database) {
    this.vaults = new VaultQueries(db);
    this.notes = new NoteQueries(db);
    this.tags = new TagQueries(db);
  }

  async transaction<T>(
    callback: (queries: DatabaseQueries) => Promise<T>,
  ): Promise<T> {
    await this.db.run("BEGIN TRANSACTION");
    try {
      const result = await callback(this);
      await this.db.run("COMMIT");
      return result;
    } catch (error) {
      await this.db.run("ROLLBACK");
      throw error;
    }
  }
}

export * from "../types";
export * from "./notes";
export * from "./tags";
export * from "./vaults";
