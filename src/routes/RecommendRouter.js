import * as RecommendController from "../controllers/RecommendController.js";
import express from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/:id")
    .get(authUserMiddleware,RecommendController.get)
    // .get(RecommendController.get)

export default router;