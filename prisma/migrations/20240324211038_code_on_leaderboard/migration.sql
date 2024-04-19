/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Leaderboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leaderboard" ADD COLUMN     "code" VARCHAR(6) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_code_key" ON "Leaderboard"("code");
