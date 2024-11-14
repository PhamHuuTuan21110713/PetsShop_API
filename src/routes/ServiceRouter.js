import express from "express";
import { authUserMiddleware, authAdminMiddleware } from "~/middlewares/authMiddleware";
import ServiceController from "~/controllers/ServiceController";
const router = express.Router();

router.route("/")
    .get(ServiceController.getAllServices)
   
    .post(ServiceController.createService) 

router.route("/:id")
    .get(ServiceController.getServiceById)



export default router;