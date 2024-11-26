// const express = require("express");
// const router = express.Router();
// const ProductController = require("../controllers/ProductController");
// const { uploadProductCloud } = require("../middlewares/uploadFileMiddleware");
// const { authAdminMiddleware } = require("../middlewares/authMiddleware");
import express from "express";
const router = express.Router();
import * as ProductController from "~/controllers/ProductController";
import { uploadProductCloud } from "~/middlewares/uploadFileMiddleware";
import { authAdminMiddleware } from "~/middlewares/authMiddleware";

router.post(
  "/",
  authAdminMiddleware,
  uploadProductCloud.single("image"),
  ProductController.createProduct
);
router.patch(
  "/add-thumbnail/:id",
  authAdminMiddleware,
  uploadProductCloud.single("image"),
  ProductController.addThumbnail
);
router.get("/", ProductController.getProducts);
router.get('/best-selling-products', ProductController.getBestSellingProducts);
router.get("/:id", ProductController.getProductById);
router.patch(
  "/:id",
  //authAdminMiddleware,
  uploadProductCloud.single("image"),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  authAdminMiddleware,
  ProductController.deleteProduct
);

export default router;
