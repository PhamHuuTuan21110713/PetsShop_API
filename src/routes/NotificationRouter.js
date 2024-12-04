import express from "express";
const router = express.Router();
import * as NotificationController from "~/controllers/NotificationController";

router.route("/")
    .get(NotificationController.findNotification)
    .post(NotificationController.createNotification)
    .patch(NotificationController.updateMany)

router.route("/:id")
    .get(NotificationController.findNotificationById)
    .patch(NotificationController.updateNotification)
    .delete(NotificationController.deleteNotification)

export default router;