-- AlterTable
ALTER TABLE `CollectionItem` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `CollectionItem_collectionId_position_idx` ON `CollectionItem`(`collectionId`, `position`);

-- Keep the current order (newest first) for existing items
UPDATE `CollectionItem` AS ci
JOIN (
    SELECT `id`, ROW_NUMBER() OVER (PARTITION BY `collectionId` ORDER BY `createdAt` DESC, `id` DESC) AS rn
    FROM `CollectionItem`
) AS ordered ON ordered.`id` = ci.`id`
SET ci.`position` = ordered.rn;
