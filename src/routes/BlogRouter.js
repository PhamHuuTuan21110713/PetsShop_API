import express from "express";
const router = express.Router();
import * as BlogController from "~/controllers/BlogController";
import { authAdminMiddleware } from "~/middlewares/authMiddleware";
import { uploadBlogCloud } from "~/middlewares/uploadFileMiddleware";


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
