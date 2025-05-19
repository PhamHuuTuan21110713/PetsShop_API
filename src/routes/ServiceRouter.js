import express from "express";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";
import ServiceController from "../controllers/ServiceController.js";
const router = express.Router();

router.route("/")
    .get(ServiceController.getAllServices)
   
    .post(authAdminMiddleware,ServiceController.createService) 

router.route("/:id")
    .get(ServiceController.getServiceById)
    .patch(authAdminMiddleware, ServiceController.updateService)
    .delete(authAdminMiddleware, ServiceController.deleteService)


export default router;