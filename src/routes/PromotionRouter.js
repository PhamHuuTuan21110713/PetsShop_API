import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import PromotionController from "~/controllers/PromotionController";
const router = express.Router();
router.route("/")
    .get(PromotionController.getAllPromotions)
    // .post(authAdminMiddleware, PromotionController.createPromotion)
    .post( PromotionController.createPromotion) //test

router.route("/:id")
    .get(PromotionController.getPromotionById)



export default router;