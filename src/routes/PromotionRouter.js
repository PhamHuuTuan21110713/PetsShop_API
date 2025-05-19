import express from "express";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";
import PromotionController from "../controllers/PromotionController.js";
const router = express.Router();
router.route("/")
    .get(
        //authAdminMiddleware, 
        PromotionController.getAllPromotions)

    // .post(authAdminMiddleware, PromotionController.createPromotion)
    .post(authAdminMiddleware, PromotionController.createPromotion) //test

router.route("/:id")
    .get(PromotionController.getPromotionById)

router.patch("/update/:id", authAdminMiddleware, PromotionController.updatePromotion)



export default router;