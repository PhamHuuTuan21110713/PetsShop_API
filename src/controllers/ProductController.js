// const ProductService = require("../services/ProductService");
import * as ProductService from "~/services/ProductService";
const createProduct = async (req, res) => {
  try {
    const { name, desc, type, price, categoryId } = req.body;
    if (!name || !desc || !type || !price || !categoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "Các trường không được để trống!",
      });
    }
    const imageFile = req.file;
    const response = await ProductService.createProduct(req.body, imageFile);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};



// const addThumbnail = async (req, res) => {
//   try {
//     const id = req.params.id;
//     console.log("Có id trong controller", id);
    
//     // Kiểm tra nếu ObjectId không hợp lệ
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         status: "ERR",
//         message: "ID sản phẩm không hợp lệ!",
//       });
//     }
//     console.log("Adding thumbnail for product id:", req.params.id); 

//     const imageFile = req.file;
//     const response = await ProductService.addThumbnail(objectId, imageFile); // Gửi objectId vào service
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(404).json({
//       message: error,
//     });
//   }
// };

const addThumbnail = async (req, res) => {
  try {
    const id = req.params.id;

    const imageFile = req.file;
    const response = await ProductService.addThumbnail(id, imageFile);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in addThumbnail:", error);  // Log chi tiết lỗi
    return res.status(500).json({
      message: error.message || "Lỗi server khi xử lý yêu cầu!",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      limit,
      page,
      sort_by,
      price_min,
      price_max,
      rating_filter,
      type,
      filters = "{}" // Mặc định là một chuỗi JSON rỗng
    } = req.query;

    // Giải mã filters từ chuỗi JSON thành đối tượng
    const parsedFilters = JSON.parse(filters); // Chuyển chuỗi thành đối tượng

    console.log("Filters received: ", parsedFilters.productId);

    // Nếu sort_by là 'sold', mặc định là 'desc' (giảm dần)
    let order = 'asc'; // Mặc định là 'asc'
    if (sort_by === 'sold') {
      order = 'desc'; // Nếu sort_by là 'sold', sắp xếp giảm dần
    }

    // Kiểm tra nếu parsedFilters có productId và gán nó cho productId
    const productId = parsedFilters.productId || ""; // Nếu không có productId, gán giá trị mặc định là chuỗi rỗng
    const name = parsedFilters.name || ""

    const response = await ProductService.getProducts(
      Number(limit) || 9,
      Number(page) || 1,
      sort_by,
      order,
      Number(price_min) || 0,
      Number(price_max) || 999999999,
      Number(rating_filter) || 0,
      name,
      type || "",
      productId // Truyền productId vào hàm
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message || error,
    });
  }
};



const getBestSellingProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Chuyển `limit` thành số, nếu không có giá trị limit thì mặc định là 10
  const parsedLimit = Number(limit);

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res.status(400).json({ message: "Limit phải là một số dương hợp lệ." });
  }

  try {
    // Gọi đến ProductService để lấy sản phẩm bán chạy nhất
    const result = await ProductService.getBestSellingProducts(page, parsedLimit);
    res.json(result);  // Trả về kết quả dưới dạng JSON
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi cho client
    console.error('Error fetching best selling products:', error);  // Log lỗi chi tiết
    res.status(500).json({ message: "Lỗi trong việc lấy sản phẩm", error: error.message });
  }
};


const getProductById = async (req, res) => {
  const  productId  = req.params.id;
  
  try {
    const result = await ProductService.getProductById(productId);  // Gọi service để lấy sản phẩm
    if (result.status === "OK") {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin sản phẩm", error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const imageFile = req.file;
    const { name, desc, type, price, state } = req.body;

    // Kiểm tra xem có thay đổi nào hay không
    if (!name && !desc && !type && !price && !state && !imageFile) {
      return res.status(400).json({
        status: "ERR",
        message: "Không có dữ liệu nào được thay đổi!",
      });
    }

    const productId = req.params.id;
    console.log("Product ID:", productId);  // Để kiểm tra ID có đúng không

    const response = await ProductService.updateProduct(req.body, productId, imageFile);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error(error);  // In lỗi ra để debug
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Có lỗi xảy ra trong quá trình cập nhật.",
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

export {
  createProduct,
  addThumbnail,
  getProducts,
  getBestSellingProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
