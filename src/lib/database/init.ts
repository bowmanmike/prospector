import fs from "node:fs";
import path from "node:path";
import { getDatabase } from "./index";

export async function initializeDatabase(): Promise<void> {
  try {
    const db = await getDatabase();

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolons and execute each statement
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      await db.run(statement);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
