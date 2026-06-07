-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'student',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dish` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `dishId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Review_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ballot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weekLabel` VARCHAR(191) NOT NULL,
    `isOpen` BOOLEAN NOT NULL DEFAULT true,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `ballotId` INTEGER NOT NULL,
    `dishIds` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Vote_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BallotDishes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BallotDishes_AB_unique`(`A`, `B`),
    INDEX `_BallotDishes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_ballotId_fkey` FOREIGN KEY (`ballotId`) REFERENCES `Ballot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BallotDishes` ADD CONSTRAINT `_BallotDishes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Ballot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BallotDishes` ADD CONSTRAINT `_BallotDishes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Dish`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
