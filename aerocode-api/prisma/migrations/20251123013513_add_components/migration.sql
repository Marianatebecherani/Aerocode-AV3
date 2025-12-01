-- CreateTable
CREATE TABLE `Component` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusType` VARCHAR(191) NOT NULL,
    `lastUpdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `qcStatus` VARCHAR(191) NULL,
    `qcDate` VARCHAR(191) NULL,
    `qcInspector` VARCHAR(191) NULL,
    `qcNotes` TEXT NULL,
    `stepId` INTEGER NOT NULL,

    INDEX `Component_stepId_idx`(`stepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `ProjectStep`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
