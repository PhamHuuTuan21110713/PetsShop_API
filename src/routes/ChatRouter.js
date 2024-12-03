// const express = require("express");
// const router = express.Router();
// const OrderController = require("../controllers/OrderController");
import express from "express";
const router = express.Router();
import * as ChatController from "~/controllers/ChatController";
import { authAdminMiddleware, authUserMiddleware } from "../middlewares/authMiddleware";

router.post("/", ChatController.createChat);
router.get("/:userId", ChatController.findUserChats);
router.get("/find/:firstId/:secondId", ChatController.findChat )

export default router;
