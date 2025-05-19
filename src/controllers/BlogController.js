import BlogService from "../services/BlogService.js";

const addBlog = async (req, res) => {
  const title = req.body.title;
  const contents = JSON.parse( req.body.contents);
  const img = req.file;


  try {
    if (!title || !contents) {
      return res.status(400).json({ status: "ERROR", message: "Các trường không được để trống!" });
    }
    const blog = await BlogService.createBlog(title, contents, img);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getBlogById = async (req, res) => {
  try {
    const blog = await BlogService.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog không tồn tại" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  // const showAll = req.query.showAll === "true" ? true : false;
  const showAll = req.query.showAll;
  //if(showAll === "all")
  try {
    const response = await BlogService.getBlogs(page, limit, showAll);

    //   if (!response.data.length) {
    //     return res.status(404).json({ status: "ERROR", message: "Không có blog nào được tìm thấy" });
    //   }

    res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    console.log("Lỗi hệ thống:", error);
    res.status(500).json({ status: "ERROR", message: "Lỗi khi lấy danh sách blog" });
  }
}


const updateBlog = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const updateBlog = await BlogService.updateBlog(id, data);

    // if (updateBlog.status === "ERROR") {
    //   return res.status(404).json(updateBlog); // Trả về lỗi nếu blog không tồn tại
    // }

    res.status(200).json(updateBlog);
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    res.status(500).json({ status: "ERROR", message: "Lỗi khi cập nhật bài viết" });
  }
}

const deleteBlog = async (req, res) => {
  try{
    const id = req.params.id;
    const response = await BlogService.deleteBlog(id);
    return res.status(200).json(response)
  } catch(error){
    return res.status(404).json({
      message: error,
    });
  }
} 

export {
  addBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
}
