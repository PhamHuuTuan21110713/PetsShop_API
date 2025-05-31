import express from "express";
const router = express.Router();
import GoogleAuthController from "../controllers/GoogleAuthController.js";
import passport from "passport"

router.get('/', passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account'}))
router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  GoogleAuthController.loginOauth // optional: xử lý thêm nếu cần
);
export default router;
