import Blog from "../models/BlogModel.js";
import { v2 as cloudinary } from "cloudinary";

const createBlog = async (title, contents, imageFile) => {
  console.log("data khi chay ne", contents);

  //const {title, contents} = data;
  try {
    const checkedBlog = await Blog.findOne({ title })
    if (checkedBlog) {
      if (imageFile) {
        cloudinary.uploader.destroy(imageFile.filename)
      }
      return {
        status: "ERR",
        message: "Bài viết đã tồn tại"
      }
    }
    else {
      const img = imageFile?.path;
      const imgPath = imageFile?.filename;
      console.log("image path: ", img);

      const newBlog = await Blog.create({ title, contents, img, imgPath });
      if (newBlog) {
        return { status: "OK", message: "Thêm blog thành công", data: newBlog };
      }
    }


  } catch (error) {
    console.log(error);

    throw new Error(`Lỗi khi tạo blog: ${error.message}`);
  }
};

const getBlogById = async (id) => {
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error("Blog không tồn tại");
    }
    return {
      status: "OK",
      message: "Lấy blog thành công",
      data: blog
    };
  } catch (error) {
    throw new Error(`Lỗi khi lấy blog: ${error.message}`);
  }
};

const getBlogs = async (page, limit, showAll) => {
  try {
    const skip = (page - 1) * limit;
    console.log("show all", showAll);
    

    // Điều kiện lọc: nếu `showAll = true`, lấy toàn bộ, ngược lại chỉ lấy blog có state = true

    // const filterCondition = showAll ? {} : { state: true };
    let filterCondition = {};
    if (showAll === "false") {
      filterCondition = { state: false }; // Chỉ lấy những blog đã ẩn
    } else if (showAll === "true") {
      filterCondition = { state: true }; // Chỉ lấy những blog đang hoạt động
    }

    // Đếm tổng số blog dựa trên điều kiện lọc
    const totalBlogs = await Blog.countDocuments(filterCondition);

    // Truy vấn danh sách blog
    const blogs = await Blog.find(filterCondition)
      .sort({ _id: -1 }) // Sắp xếp từ mới đến cũ
      .skip(skip)
      .limit(limit)
      .select("title contents img state createdAt");

    return {
      status: "OK",
      message: "Lấy danh sách bài viết thành công",
      data: {
        blogs,
        currentPage: Number(page),
        totalPage: Math.ceil(totalBlogs / limit),
        totalBlogs
      }
    };

  } catch (error) {
    throw new Error(`Lỗi khi lấy blog: ${error.message}`);
  }
};

const updateBlog = async (id, data) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, data, { new: true });

    if (!updateBlog) {
      return { status: "ERROR", message: "Blog không tồn tại" };
    }

    return { status: "OK", message: "Bài viết đã được cập nhật", data: updateBlog };

  } catch (error) {
    console.error("Lỗi khi cập nhật blog:", error);
    return { status: "ERROR", message: `Lỗi khi update blog: ${error.message}` };
  }
};

const deleteBlog = async (id) => {
  try {
    const blog = await Blog.findById(id);
    if(blog){
      if(blog?.imgPath){
        cloudinary.uploader.destroy(blog.imgPath);
      }
      await Blog.findByIdAndDelete(id)
      return{
        status: "OK",
        message: "Xóa blog thành công"
      }
    } else{
      return {
        status: "ERROR",
        message: "Không tìm thấy sản phẩm!"
      }
    }
  } catch(error){
    return { status: "ERROR", message: `Lỗi khi xóaóa blog: ${error.message}` };

  }
}

export default { createBlog, getBlogById, getBlogs, updateBlog, deleteBlog };
