import BookingController from "~/controllers/BookingController";
import express from "express";
import { authAdminMiddleware } from "~/middlewares/authMiddleware";
const router = express.Router();

router.route("/")
    .get(BookingController.getAll)
   
    .post(BookingController.createNew) 

router.route("/:id")
    .get(BookingController.getById)
    .patch(authAdminMiddleware,BookingController.update)


export default router;