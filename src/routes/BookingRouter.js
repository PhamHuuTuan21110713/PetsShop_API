import BookingController from "../controllers/BookingController.js";
import express from "express";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/")
    .get(BookingController.getAll)
   
    .post(BookingController.createNew) 

router.route("/:id")
    .get(BookingController.getById)
    .patch(authAdminMiddleware,BookingController.update)


export default router;