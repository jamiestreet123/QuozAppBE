import express from "express";
import ScoreController from "../controllers/score.controller";
import { isAuthenticated } from '../middleware';

const router = express.Router();

router.post("/", isAuthenticated, ScoreController.postScore);
router.get("/", isAuthenticated, ScoreController.getScoreByDate);
router.get("/:userId/recent", isAuthenticated, ScoreController.getRecentScoresByUser);
router.get("/:user_id/profile", isAuthenticated, ScoreController.getProfileScores);

export default router;