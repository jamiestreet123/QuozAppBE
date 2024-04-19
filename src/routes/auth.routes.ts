import express from "express";
import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.login);
router.post("/refreshToken", AuthController.refreshToken);
router.get("/", AuthController.auth);
router.get("/revoke/:user_id", AuthController.revokeToken);

export default router;