const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { uploadUserCloud } = require("../middlewares/uploadFileMiddleware");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middlewares/authMiddleware");

router.post(
  "/register",
  uploadUserCloud.single("avatar"),
  UserController.createUser
);
router.post("/login", UserController.loginUser);
router.post("/forgot-password", UserController.forgotPassword);
router.patch("/reset-password", UserController.resetPassword);
router.post("/send-message", UserController.sendMessage);
router.get("/get-all", authAdminMiddleware, UserController.getAllUser);
router.get("/get-by-id/:id", authUserMiddleware, UserController.getUserById);
router.patch(
  "/update/:id",
  authUserMiddleware,
  uploadUserCloud.single("avatar"),
  UserController.updateUser
);
router.delete("/delete/:id", authAdminMiddleware, UserController.deleteUser);
router.patch("/add-to-cart/:id", authUserMiddleware, UserController.addToCart);
router.patch(
  "/remove-from-cart/:id",
  authUserMiddleware,
  UserController.removeFromCart
);
router.post("/payment/:id", authUserMiddleware, UserController.payment);
router.patch("/clear-cart/:id", authUserMiddleware, UserController.clearCart);
router.post("/refresh-token", UserController.refreshToken);

module.exports = router;
