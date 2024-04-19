import express from "express";
import QuizController from "../controllers/quiz.controller";
import { isAuthenticated } from '../middleware';

const router = express.Router();

router.post("/create", QuizController.postQuiz);
router.get("/:date", isAuthenticated, QuizController.getQuizByDate);

export default router;