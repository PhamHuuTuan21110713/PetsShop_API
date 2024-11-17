import BookingController from "~/controllers/BookingController";
import express from "express";
const router = express.Router();

router.route("/")
    .get(BookingController.getAll)
   
    .post(BookingController.createNew) 

router.route("/:id")
    .get(BookingController.getById)



export default router;