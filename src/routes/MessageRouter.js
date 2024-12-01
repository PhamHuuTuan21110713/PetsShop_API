
import express from "express";
const router = express.Router();
import * as MessageController from "~/controllers/MessageController";


router.post("/", MessageController.createMessage);
router.get("/:chatId", MessageController.getMessage);


export default router;
