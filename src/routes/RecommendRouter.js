import * as RecommendController from "../controllers/RecommendController.js";
import express from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/:id")
    .get(authUserMiddleware,RecommendController.get)
    // .get(RecommendController.get)

router.route("/:id")
    .patch(authUserMiddleware,RecommendController.update)

router.route("/:id/check-like")
    .patch(authUserMiddleware,RecommendController.checkLiked)
export default router;