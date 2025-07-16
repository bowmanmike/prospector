import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";

// Enable verbose mode for debugging
sqlite3.verbose();

export interface Database {
  run: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  get: <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
  all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  close: () => Promise<void>;
}

class DatabaseConnection {
  private db: sqlite3.Database | null = null;

  async connect(): Promise<Database> {
    if (this.db) {
      return this.wrapDatabase(this.db);
    }

    const dbPath = path.join(process.cwd(), "data", "prospector.db");
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`Connected to SQLite database at ${dbPath}`);
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

  async close(): Promise<void> {
    if (this.db) {
      await promisify(this.db.close.bind(this.db))();
      this.db = null;
    }
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

export async function getDatabase(): Promise<Database> {
  return dbConnection.connect();
}

export async function closeDatabase(): Promise<void> {
  return dbConnection.close();
}

// Export queries for convenience
export { DatabaseQueries } from "./queries";
export * from "./types";