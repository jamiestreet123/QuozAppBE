import express from "express";
import LeaderboardController from '../controllers/leaderboard.controller';
import { isAuthenticated } from "../middleware";

const router = express.Router();

router.post("/create", isAuthenticated, LeaderboardController.postLeaderboard);
router.get("/user/:user_id", isAuthenticated, LeaderboardController.userLeaderboards);
router.get("/:leaderboard_id", isAuthenticated, LeaderboardController.getLeaderboard);
router.get("/:leaderboard_id/admin", isAuthenticated, LeaderboardController.getLeaderboardAdmin);
router.get("/:leaderboard_id/:type", isAuthenticated, LeaderboardController.getLeaderboard);
router.post("/request", isAuthenticated, LeaderboardController.requestLeaderboard);
router.post("/accept", isAuthenticated, LeaderboardController.acceptLeaderboard);
router.post("/admin", isAuthenticated, LeaderboardController.makeAdmin);
router.post("/remove", isAuthenticated, LeaderboardController.removeUser);
router.post("/toggle", isAuthenticated, LeaderboardController.toggleAccess);
router.post("/reject", isAuthenticated, LeaderboardController.rejectRequest);
router.post("/remove-admin", isAuthenticated, LeaderboardController.removeAdmin);
router.post("/leave", isAuthenticated, LeaderboardController.leaveLeaderboard);


export default router;