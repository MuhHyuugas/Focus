import * as SQLite from "expo-sqlite";

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null; // Use null initially

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initDb(): Promise<void> {
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync("focus_v2.db");

    await this.db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        nome TEXT,
        email TEXT,
        senha_hash TEXT,
        telefone TEXT,
        avatar TEXT,
        data_nascimento TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        dosagem_padrao TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS treatments (
        id TEXT PRIMARY KEY NOT NULL,
        id_usuario TEXT NOT NULL,
        id_medicamento TEXT NOT NULL,
        dose TEXT,
        dias TEXT,
        horarios TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (id_usuario) REFERENCES users (id),
        FOREIGN KEY (id_medicamento) REFERENCES medications (id)
      );

      CREATE TABLE IF NOT EXISTS dose_logs (
        id TEXT PRIMARY KEY NOT NULL,
        id_tratamento TEXT NOT NULL,
        horario_plano TEXT,
        horario_tomado TEXT,
        humor INTEGER,
        ansiedade INTEGER,
        foco INTEGER,
        notas TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (id_tratamento) REFERENCES treatments (id)
      );
    `);
  }

  public async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      await this.initDb();
    }

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    // expo-sqlite v14+ generic helper
    // For SELECT queries we use getAllAsync, for others runAsync
    const isSelect = query.trim().toUpperCase().startsWith("SELECT");

    try {
      console.log(`[SQLite] Executing: ${query} | Params: ${JSON.stringify(params)}`);
      if (isSelect) {
        return await this.db.getAllAsync(query, params);
      } else {
        await this.db.runAsync(query, params);
        // For insert/update, usually we don't need to return rows like SELECT.
        // If needed, we can return empty array or specific result structure.
        return [];
      }
    } catch (error) {
      console.error("Query execution error:", error);
      throw error;
    }
  }
}
