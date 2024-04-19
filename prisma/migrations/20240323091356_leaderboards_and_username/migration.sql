/*
  Warnings:

  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_leaderBoardAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_leaderboardMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_leaderBoardAdmins_AB_unique" ON "_leaderBoardAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_leaderBoardAdmins_B_index" ON "_leaderBoardAdmins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_leaderboardMembers_AB_unique" ON "_leaderboardMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_leaderboardMembers_B_index" ON "_leaderboardMembers"("B");

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_leaderBoardAdmins" ADD CONSTRAINT "_leaderBoardAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_leaderBoardAdmins" ADD CONSTRAINT "_leaderBoardAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_leaderboardMembers" ADD CONSTRAINT "_leaderboardMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_leaderboardMembers" ADD CONSTRAINT "_leaderboardMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
