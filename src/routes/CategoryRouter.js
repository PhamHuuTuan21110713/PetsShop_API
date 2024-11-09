import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import CategoryController from "~/controllers/CategoryController"

const router = express.Router();

router.route("/")
    .get(CategoryController.getAllCategories)
    // .post(authAdminMiddleware, CategoryController.createNewCategory)
    .post( CategoryController.createNewCategory) //test

router.route("/:id")
    .get(CategoryController.getCategoryById)



export default router;
