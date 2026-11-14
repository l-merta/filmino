-- CreateTable
CREATE TABLE `RecommendationSource` (
    `userId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecommendationSource_collectionId_idx`(`collectionId`),
    PRIMARY KEY (`userId`, `collectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecommendationSource` ADD CONSTRAINT `RecommendationSource_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationSource` ADD CONSTRAINT `RecommendationSource_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

