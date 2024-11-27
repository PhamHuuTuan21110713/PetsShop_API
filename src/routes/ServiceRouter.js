import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import ServiceController from "~/controllers/ServiceController";
const router = express.Router();

router.route("/")
    .get(ServiceController.getAllServices)
   
    .post(authAdminMiddleware,ServiceController.createService) 

router.route("/:id")
    .get(ServiceController.getServiceById)
    .patch(authAdminMiddleware, ServiceController.updateService)
    .delete(authAdminMiddleware, ServiceController.deleteService)


export default router;