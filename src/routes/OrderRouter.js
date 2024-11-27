// const express = require("express");
// const router = express.Router();
// const OrderController = require("../controllers/OrderController");
import express from "express";
const router = express.Router();
import * as OrderController from "~/controllers/OrderController";
import { authAdminMiddleware, authUserMiddleware } from "../middlewares/authMiddleware";


router.post("/create",
  //authUserMiddleware,
  OrderController.createOrder);

router.get("/", authAdminMiddleware, OrderController.getAllOrder)
router.get(
  "/get-by-user/:id",
  // authUserMiddleware,
  OrderController.getOrderByUser
);

router.patch("/update/:id", authAdminMiddleware, OrderController.updateOrder)

router.patch(
  "/complete/:id",
  // authAdminMiddleware,
  OrderController.completeOrder
);

export default router;
