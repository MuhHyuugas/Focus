export const SQLITE_SCHEMA = [
  // 1. Usuários
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT,
    telefone TEXT,
    avatar TEXT,
    data_nascimento TEXT, -- ISO YYYY-MM-DD
    created_at INTEGER,   -- Epoch MS (UTC)
    updated_at INTEGER    -- Epoch MS (UTC)
  );`,

  // 2. Medicamentos (Catálogo)
  `CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    dosagem_padrao TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );`,

  // 3. Tratamentos (Relação User <-> Med)
  `CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY NOT NULL,
    id_usuario TEXT NOT NULL,
    id_medicamento TEXT NOT NULL,
    dose TEXT,          -- String livre
    dias TEXT,          -- JSON String
    horarios TEXT,      -- JSON String
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES medications(id)
  );`,

  // 4. Registros de Doses (Logs + Sintomas)
  `CREATE TABLE IF NOT EXISTS dose_logs (
    id TEXT PRIMARY KEY NOT NULL,
    id_tratamento TEXT NOT NULL,
    horario_plano TEXT NOT NULL,  -- ISO 8601 String
    horario_tomado TEXT NOT NULL, -- ISO 8601 String
    
    -- Sintomas atrelados à dose
    humor INTEGER,
    ansiedade INTEGER, -- 0 = False, 1 = True
    foco INTEGER,      -- 1 a 5
    notas TEXT,

    created_at INTEGER,
    updated_at INTEGER,
    
    FOREIGN KEY (id_tratamento) REFERENCES treatments(id) ON DELETE CASCADE,
    CHECK (foco >= 1 AND foco <= 5),
    CHECK (ansiedade IN (0, 1))
  );`
];