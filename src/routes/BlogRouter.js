import express from "express";
const router = express.Router();
import * as BlogController from "../controllers/BlogController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";
import { uploadBlogCloud } from "../middlewares/uploadFileMiddleware.js";


router.route('/')
    .get(BlogController.getBlogs) // Ai cũng có thể xem blog
    .post(
        authAdminMiddleware,
        uploadBlogCloud.single("image"), 
        BlogController.addBlog) // Chỉ admin mới được thêm blog

router.route("/:id")
    .get( BlogController.getBlogById) // Ai cũng có thể xem blog
    .patch(
    authAdminMiddleware,
    BlogController.updateBlog)
    .delete(BlogController.deleteBlog)
export default router;
