CREATE TABLE `api_metricas` (
    `id` VARCHAR(36) NOT NULL,
    `metodo` VARCHAR(10) NOT NULL,
    `caminho` VARCHAR(255) NOT NULL,
    `rota` VARCHAR(255) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `duracaoMs` DOUBLE NOT NULL,
    `iniciadoEm` DATETIME(3) NOT NULL,
    `finalizadoEm` DATETIME(3) NOT NULL,
    `ip` VARCHAR(80) NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_metricas_metodo_idx`(`metodo`),
    INDEX `api_metricas_rota_idx`(`rota`),
    INDEX `api_metricas_statusCode_idx`(`statusCode`),
    INDEX `api_metricas_duracaoMs_idx`(`duracaoMs`),
    INDEX `api_metricas_iniciadoEm_idx`(`iniciadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
