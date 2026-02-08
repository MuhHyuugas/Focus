-- aws_schema.sql
-- Last Sync from AWS: 2026-02-08

-- 1. Users (Sync Target)
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Medications Catalog
CREATE TABLE IF NOT EXISTS `medications` (
  `id` char(36) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `dosagem_padrao` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Treatments (User's Schedule)
CREATE TABLE IF NOT EXISTS `treatments` (
  `id` char(36) NOT NULL,
  `id_usuario` char(36) NOT NULL,
  `id_medicamento` char(36) NOT NULL,
  `dose` varchar(50) DEFAULT NULL,
  `dias` json DEFAULT NULL,
  `horarios` json DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ativo',
  `data_inicio` datetime DEFAULT NULL,
  `data_fim` datetime DEFAULT NULL,
  `created_at?` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_medicamento` (`id_medicamento`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `treatments_ibfk_1` FOREIGN KEY (`id_medicamento`) REFERENCES `medications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `treatments_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Dose Logs (History)
CREATE TABLE IF NOT EXISTS `dose_logs` (
  `id` char(36) NOT NULL,
  `id_tratamento` char(36) NOT NULL,
  `horario_plano` datetime DEFAULT NULL,
  `horario_tomado` datetime DEFAULT NULL,
  `notas` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_tratamento` (`id_tratamento`),
  CONSTRAINT `dose_logs_ibfk_1` FOREIGN KEY (`id_tratamento`) REFERENCES `treatments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Daily Marks (Check-in)
CREATE TABLE IF NOT EXISTS `daily_marks` (
  `id` char(36) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `data` date NOT NULL,
  `id_usuario` char(36) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_marks` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Side Effects (Symptoms)
CREATE TABLE IF NOT EXISTS `side_effects` (
  `id` char(36) NOT NULL,
  `id_tratamento` char(36) NOT NULL,
  `tipo_id` varchar(50) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `data` datetime NOT NULL,
  `humor` int DEFAULT NULL,
  `ansiedade` tinyint(1) NOT NULL DEFAULT '0',
  `foco` int DEFAULT NULL,
  `notas` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_tratamento` (`id_tratamento`),
  CONSTRAINT `side_effects_ibfk_1` FOREIGN KEY (`id_tratamento`) REFERENCES `treatments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
