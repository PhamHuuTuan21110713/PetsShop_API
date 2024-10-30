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
  "/create",
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
router.get("/get", ProductController.getProducts);
router.get("/get-by-id/:id", ProductController.getProductById);
router.patch(
  "/update/:id",
  authAdminMiddleware,
  uploadProductCloud.single("image"),
  ProductController.updateProduct
);
router.delete(
  "/delete/:id",
  authAdminMiddleware,
  ProductController.deleteProduct
);

module.exports = router;
