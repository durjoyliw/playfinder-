-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TEAMMATE';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';
