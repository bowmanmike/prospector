import sqlite3 from "sqlite3";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { Database } from "../index";
import { DatabaseQueries } from "../queries";

export class TestDatabase {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    // Create unique test database file
    this.dbPath = path.join(__dirname, `test-${Date.now()}-${Math.random()}.db`);
  }

  async connect(): Promise<Database> {
    if (this.db) {
      return this.wrapDatabase(this.db);
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.wrapDatabase(this.db!));
      });
    });
  }

  private wrapDatabase(db: sqlite3.Database): Database {
    return {
      run: (sql: string, params?: any[]) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params || [], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this);
            }
          });
        });
      },
      get: promisify(db.get.bind(db)),
      all: promisify(db.all.bind(db)),
      close: promisify(db.close.bind(db)),
    };
  }

  async initialize(): Promise<void> {
    const db = await this.connect();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, "..", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      await db.run(statement);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await promisify(this.db.close.bind(this.db))();
      this.db = null;
      
      // Clean up test database file
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath);
      }
    }
  }
}

export async function setupTestDatabase(): Promise<{ db: Database; queries: DatabaseQueries; cleanup: () => Promise<void> }> {
  const testDb = new TestDatabase();
  await testDb.initialize();
  const db = await testDb.connect();
  const queries = new DatabaseQueries(db);

  return {
    db,
    queries,
    cleanup: () => testDb.close(),
  };
}

export const mockVault = {
  path: "/test/vault",
  name: "Test Vault",
};

export const mockNote = {
  vault_id: 1,
  file_path: "/test/vault/note.md",
  file_name: "note.md",
  file_size: 1024,
  modified_time: "2024-01-01T00:00:00.000Z",
  created_time: "2024-01-01T00:00:00.000Z",
  content_hash: "abc123",
  title: "Test Note",
  frontmatter_tags: ["tag1", "tag2"],
  frontmatter_data: { author: "test", priority: "high" },
  word_count: 100,
  character_count: 500,
};

export const mockTag = {
  vault_id: 1,
  name: "test-tag",
};

// Add a dummy test to prevent Jest from complaining about no tests
describe("Test Utils", () => {
  it("should export test utilities", () => {
    expect(mockVault).toBeDefined();
    expect(mockNote).toBeDefined();
    expect(mockTag).toBeDefined();
  });
});