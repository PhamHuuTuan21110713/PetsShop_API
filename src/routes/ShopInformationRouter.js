import express from "express";
import ShopInformationController from "../controllers/ShopInformationController.js";
const router = express.Router();

router.route("/:id")
    .get(ShopInformationController.getInformationById)

router.route("/")
    .post(ShopInformationController.createInformation)

export default router;