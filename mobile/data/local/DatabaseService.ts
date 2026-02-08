import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { SEED_MEDICATIONS } from "./SeedData";

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null; // Use null initially

  private constructor() { }

  // padrão singleton para garantir que tenhamos apenas uma instância do banco de dados
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
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
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
        status TEXT DEFAULT 'ativo',
        data_inicio TEXT,
        data_fim TEXT,
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

      CREATE TABLE IF NOT EXISTS daily_marks (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS side_effects (
        id TEXT PRIMARY KEY NOT NULL,
        id_tratamento TEXT NOT NULL,
        tipo_id TEXT NOT NULL,
        descricao TEXT NOT NULL,
        data TEXT NOT NULL,
        humor INTEGER,
        ansiedade INTEGER,
        foco INTEGER,
        notas TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (id_tratamento) REFERENCES treatments (id)
      );
    `);

    await this.seed();
  }

  private async seed() {
    try {
      if (!this.db) return;

      const result = await this.db.getAllAsync<{ count: number }>(
        "SELECT count(*) as count FROM medications",
      );
      const count = result[0]?.count || 0;

      if (count === 0) {
        console.log(
          "[DatabaseService] Seeding database with initial medications...",
        );
        const now = Date.now();

        for (const med of SEED_MEDICATIONS) {
          const id = Crypto.randomUUID();
          await this.db.runAsync(
            "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [id, med.name, med.dosage, now, now],
          );
        }
        console.log(
          `[DatabaseService] Seeded ${SEED_MEDICATIONS.length} medications.`,
        );
      }
    } catch (e) {
      console.error("Error seeding database:", e);
    }
  }

  public async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      await this.initDb();
    }

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const isSelect = query.trim().toUpperCase().startsWith("SELECT");

    try {
      console.log(
        `[SQLite] Executing: ${query} | Params: ${JSON.stringify(params)}`,
      );
      if (isSelect) {
        return await this.db.getAllAsync(query, params);
      } else {
        await this.db.runAsync(query, params);
        return [];
      }
    } catch (error) {
      console.error("Query execution error:", error);
      throw error;
    }
  }
}
