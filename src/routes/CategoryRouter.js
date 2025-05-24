import express from "express";
import CategoryController from "../controllers/CategoryController.js"

const router = express.Router();

router.route("/")
    .get(CategoryController.getAllCategories)
    .post(CategoryController.createNewCategory) //test

router.route("/categories-report")
    .get(CategoryController.getCategorySales)

router.route("/:id")
    .get(CategoryController.getCategoryById)




export default router;
