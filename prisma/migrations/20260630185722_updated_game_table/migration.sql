/*
  Warnings:

  - You are about to drop the column `timezone` on the `games` table. All the data in the column will be lost.
  - Made the column `endsAt` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "games" DROP COLUMN "timezone",
ADD COLUMN     "cancelledAt" TIMESTAMPTZ(3),
ADD COLUMN     "costPerPlayer" DECIMAL(10,2),
ADD COLUMN     "notes" VARCHAR(500),
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'UPCOMING',
ALTER COLUMN "endsAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "games_status_idx" ON "games"("status");
