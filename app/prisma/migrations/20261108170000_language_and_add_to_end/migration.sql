-- AlterTable
ALTER TABLE `Users` ADD COLUMN `textLanguage` VARCHAR(16) NOT NULL DEFAULT 'cs',
    ADD COLUMN `imageLanguage` VARCHAR(16) NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE `Collection` ADD COLUMN `addToEnd` BOOLEAN NOT NULL DEFAULT false;
