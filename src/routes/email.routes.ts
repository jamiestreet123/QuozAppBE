import express from "express";
import EmailController from '../controllers/email.controller';
import { isAuthenticated } from "../middleware";

const router = express.Router();

router.get("/send/reset-password", EmailController.resetPasswordEmail);
router.post("/reset-password", EmailController.resetPassword);
router.post("/change-password", isAuthenticated, EmailController.changePassword);

export default router;