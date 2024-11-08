import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import CategoryController from "~/controllers/CategoryController"

const router = express.Router();

router.route("/")
    .get(CategoryController.getAllCategories)
    .post(CategoryController.createNewCategory)

router.route("/:id")
    


export default router;
