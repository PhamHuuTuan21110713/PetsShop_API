import express from "express";
const router = express.Router();

import { loginUser, createUser, refreshToken, logout, registerUser } from "~/controllers/UserController";
import { uploadUserCloud } from "~/middlewares/uploadFileMiddleware";
import JWTService from "~/services/JWTService";

router.post("/login", loginUser);
// router.post("/register", uploadUserCloud.single("avatar"), createUser);
router.post("/register", registerUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/check-token", JWTService.checkToken);

export default router;