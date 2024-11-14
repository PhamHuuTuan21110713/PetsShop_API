import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import ShopInformationController from "~/controllers/ShopInformationController";
const router = express.Router();

router.route("/:id")
    .get(ShopInformationController.getInformationById)

router.route("/")
    .post(ShopInformationController.createInformation)

export default router;