
import express from "express";
const router = express.Router();
import * as UserController from "../controllers/UserController.js";
import { uploadUserCloud } from "../middlewares/uploadFileMiddleware.js";
import { authUserMiddleware, authAdminMiddleware } from "../middlewares/authMiddleware.js";


router.route('/')

  .get(authAdminMiddleware, UserController.getAllUser)
  .post(authAdminMiddleware, UserController.createMany)
// .get( UserController.getAllUser)
router.route("/get-by-email/:email")
  .get( UserController.getByEmail)

router.route('/:id')
  .get(authUserMiddleware, UserController.getUserById)
  // .get(UserController.getUserById)
  .delete(authAdminMiddleware, UserController.deleteUser)
  .patch(authUserMiddleware, uploadUserCloud.single("avatar"), UserController.updateUser)
  

router.post("/forget-password/:id", UserController.forgotPassword);
router.route('/shipping-address/:id')
  .patch(authUserMiddleware, UserController.updateShippingAddress)
router.post("/check-password/:id",authUserMiddleware, UserController.checkPassword)
router.patch("/reset-password/:id",authUserMiddleware, UserController.resetPassword);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/send-message", UserController.sendMessage);

router.patch("/add-to-cart/:id", authUserMiddleware, UserController.addToCart);
router.patch("/update-cart/:id", authUserMiddleware, UserController.updateCart);
router.patch("/remove-from-cart/:id", authUserMiddleware, UserController.removeFromCart);
router.patch("/clear-cart/:id", authUserMiddleware, UserController.clearCart);
router.post("/payment/:id", authUserMiddleware, UserController.payment);
router.post("/update-view/:id", UserController.updateView)

export default router;
