import express from "express";
const router = express.Router();

import { loginUser, createUser, refreshToken } from "~/controllers/UserController";
import { uploadUserCloud } from "~/middlewares/uploadFileMiddleware";

router.post("/login", loginUser);
// router.post("/register", uploadUserCloud.single("avatar"), createUser);
router.post("/register", createUser);
router.post("/refresh-token", refreshToken);
export default router;