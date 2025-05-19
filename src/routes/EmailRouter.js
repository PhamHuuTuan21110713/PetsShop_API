import { authUserMiddleware } from "../middlewares/authMiddleware.js";
import EmailController from "../controllers/EmailController.js";
import express from "express";
const router = express.Router();

router.post("/send-pin/:id", authUserMiddleware, EmailController.sendPIN);
router.post("/send-pin", EmailController.sendPIN); //test
router.post("/check-pin/:id",authUserMiddleware, EmailController.checkPIN);
router.post("/check-pin/", EmailController.checkPIN);
router.get("/verify-email", EmailController.verifyEmail);
export default router;