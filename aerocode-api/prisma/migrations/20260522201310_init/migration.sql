-- CreateTable
CREATE TABLE `aeronaves` (
    `codigo` VARCHAR(20) NOT NULL,
    `modelo` VARCHAR(120) NOT NULL,
    `tipo` ENUM('COMERCIAL', 'MILITAR') NOT NULL,
    `capacidade` INTEGER NOT NULL,
    `alcance` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `tipo` ENUM('NACIONAL', 'IMPORTADA') NOT NULL,
    `fornecedor` VARCHAR(120) NOT NULL,
    `aeronaveCodigo` VARCHAR(20) NOT NULL,
    `statusTracker` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pecas_aeronaveCodigo_idx`(`aeronaveCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapas` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `prazoConclusao` DATETIME(3) NOT NULL,
    `prioridade` INTEGER NOT NULL,
    `aeronaveCodigo` VARCHAR(20) NOT NULL,
    `statusTracker` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `etapas_aeronaveCodigo_idx`(`aeronaveCodigo`),
    UNIQUE INDEX `etapas_nome_aeronaveCodigo_key`(`nome`, `aeronaveCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testes` (
    `id` VARCHAR(36) NOT NULL,
    `tipo` ENUM('ELETRICO', 'HIDRAULICO', 'AERODINAMICO') NOT NULL,
    `aeronaveCodigo` VARCHAR(20) NOT NULL,
    `resultadoTracker` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `testes_aeronaveCodigo_idx`(`aeronaveCodigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionarios` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `telefone` VARCHAR(30) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `usuario` VARCHAR(80) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `nivelPermissao` ENUM('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `funcionarios_usuario_key`(`usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios` (
    `id` VARCHAR(36) NOT NULL,
    `aeronaveCodigo` VARCHAR(20) NOT NULL,
    `dataEmissao` DATETIME(3) NOT NULL,
    `status` ENUM('EM_PRODUCAO', 'FINALIZADA') NOT NULL,
    `detalhes` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `relatorios_aeronaveCodigo_idx`(`aeronaveCodigo`),
    INDEX `relatorios_dataEmissao_idx`(`dataEmissao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EtapaFuncionarios` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_EtapaFuncionarios_AB_unique`(`A`, `B`),
    INDEX `_EtapaFuncionarios_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_aeronaveCodigo_fkey` FOREIGN KEY (`aeronaveCodigo`) REFERENCES `aeronaves`(`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etapas` ADD CONSTRAINT `etapas_aeronaveCodigo_fkey` FOREIGN KEY (`aeronaveCodigo`) REFERENCES `aeronaves`(`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testes` ADD CONSTRAINT `testes_aeronaveCodigo_fkey` FOREIGN KEY (`aeronaveCodigo`) REFERENCES `aeronaves`(`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_aeronaveCodigo_fkey` FOREIGN KEY (`aeronaveCodigo`) REFERENCES `aeronaves`(`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EtapaFuncionarios` ADD CONSTRAINT `_EtapaFuncionarios_A_fkey` FOREIGN KEY (`A`) REFERENCES `etapas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EtapaFuncionarios` ADD CONSTRAINT `_EtapaFuncionarios_B_fkey` FOREIGN KEY (`B`) REFERENCES `funcionarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
