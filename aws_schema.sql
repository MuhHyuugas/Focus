-- aws_schema.sql
-- This schema defines the tables required by the Focus Mobile App.
-- Hand this file to the Backend Developer.

-- 1. Users (Sync Target)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255), -- Helper for backend auth if needed
    telefone VARCHAR(20),
    avatar VARCHAR(255),
    data_nascimento DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Medications Catalog (Admin Managed)
CREATE TABLE IF NOT EXISTS medications (
    id CHAR(36) PRIMARY KEY, -- UUID
    nome VARCHAR(255) NOT NULL,
    dosagem_padrao VARCHAR(50), -- e.g., "10mg"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Treatments (User's Schedule)
-- Replaces the old 'intervalo_horas' model with a flexible day/time schedule.
CREATE TABLE IF NOT EXISTS treatments (
    id CHAR(36) PRIMARY KEY, -- UUID
    id_usuario CHAR(36) NOT NULL, -- UUID from Users table
    id_medicamento CHAR(36) NOT NULL,
    dose VARCHAR(50), -- Custom dose (e.g., "2 pills")
    dias JSON, -- Stored as JSON: ["seg", "qua", "sex"]
    horarios JSON, -- Stored as JSON: ["08:00", "20:00"]
    status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'finalizado'
    data_inicio DATETIME,
    data_fim DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medicamento) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Dose Logs (History)
CREATE TABLE IF NOT EXISTS dose_logs (
    id CHAR(36) PRIMARY KEY, -- UUID
    id_tratamento CHAR(36) NOT NULL,
    horario_plano DATETIME, -- When they were supposed to take it
    horario_tomado DATETIME, -- When they actually took it
    humor INT, -- 1-5
    ansiedade BOOLEAN,
    foco INT, -- 1-5
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tratamento) REFERENCES treatments(id) ON DELETE CASCADE
);
-- 4. Daily Marks (Check-in)
CREATE TABLE IF NOT EXISTS daily_marks (
    id CHAR(36) PRIMARY KEY,
    id_usuario CHAR(36) NOT NULL, -- Added to associate with user
    data DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
);
