// const express = require("express");
// const router = express.Router();
// const UserController = require("../controllers/UserController");
// const { uploadUserCloud } = require("../middlewares/uploadFileMiddleware");
// const {
//   authUserMiddleware,
//   authAdminMiddleware,
// } = require("../middlewares/authMiddleware");

import express from "express";
const router = express.Router();
import * as UserController from "~/controllers/UserController";
import { uploadUserCloud } from "~/middlewares/uploadFileMiddleware";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";

router.route('/')

  .get(authAdminMiddleware, UserController.getAllUser)
  // .get( UserController.getAllUser)

router.route('/:id')
  .get(authUserMiddleware, UserController.getUserById)
  // .get(UserController.getUserById)
  .delete(authAdminMiddleware, UserController.deleteUser)
  .patch(authUserMiddleware,uploadUserCloud.single("avatar"),UserController.updateUser)

// router.post("/register",uploadUserCloud.single("avatar"),UserController.createUser);
// router.post("/login", UserController.loginUser);
router.post("/forgot-password", UserController.forgotPassword);
router.patch("/reset-password", UserController.resetPassword);
router.post("/send-message", UserController.sendMessage);

router.patch("/add-to-cart/:id", authUserMiddleware, UserController.addToCart);
router.patch("/remove-from-cart/:id",authUserMiddleware,UserController.removeFromCart);
router.patch("/clear-cart/:id", authUserMiddleware, UserController.clearCart);
router.post("/payment/:id", authUserMiddleware, UserController.payment);


export default router;
