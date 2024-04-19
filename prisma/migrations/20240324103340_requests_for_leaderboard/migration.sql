-- CreateTable
CREATE TABLE "_leaderBoardRequests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_leaderBoardRequests_AB_unique" ON "_leaderBoardRequests"("A", "B");

-- CreateIndex
CREATE INDEX "_leaderBoardRequests_B_index" ON "_leaderBoardRequests"("B");

-- AddForeignKey
ALTER TABLE "_leaderBoardRequests" ADD CONSTRAINT "_leaderBoardRequests_A_fkey" FOREIGN KEY ("A") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_leaderBoardRequests" ADD CONSTRAINT "_leaderBoardRequests_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
