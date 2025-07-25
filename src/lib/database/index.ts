import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import fs from "fs";

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
  private initialized = false;

  async connect(): Promise<Database> {
    if (this.db) {
      return this.wrapDatabase(this.db);
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, "prospector.db");
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`Connected to SQLite database at ${dbPath}`);
        
        // Initialize database schema if not already done
        if (!this.initialized) {
          try {
            await this.initializeSchema();
            this.initialized = true;
          } catch (initError) {
            reject(initError);
            return;
          }
        }
        
        resolve(this.wrapDatabase(this.db!));
      });
    });
  }

  private async initializeSchema(): Promise<void> {
    if (!this.db) return;
    
    try {
      // Read and execute schema file
      const schemaPath = path.join(process.cwd(), "src", "lib", "database", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      
      // Split by semicolons and execute each statement
      const statements = schema
        .split(";")
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      const wrappedDb = this.wrapDatabase(this.db);
      for (const statement of statements) {
        await wrappedDb.run(statement);
      }
      
      console.log("Database schema initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database schema:", error);
      throw error;
    }
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