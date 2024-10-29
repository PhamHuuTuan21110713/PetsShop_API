const ProductService = require("../services/ProductService");

const createProduct = async (req, res) => {
  try {
    const { name, desc, type, price } = req.body;
    if (!name || !desc || !type || !price) {
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

const addThumbnail = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(200).json({
        status: "ERR",
        message: "Các trường không được để trống!",
      });
    }
    const imageFile = req.file;
    const response = await ProductService.addThumbnail(id, imageFile);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      limit,
      page,
      sort_by,
      order,
      price_min,
      price_max,
      rating_filter,
      name,
      type,
    } = req.query;
    const response = await ProductService.getProducts(
      Number(limit) || 9,
      Number(page) || 1,
      sort_by,
      order,
      Number(price_min) || 0,
      Number(price_max) || 999999999,
      Number(rating_filter) || 0,
      name || "",
      type || ""
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const response = await ProductService.getProductById(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const imageFile = req.file;
    const { name, desc, type, price } = req.body;
    if (!name && !desc && !type && !price && !imageFile) {
      return res.status(200).json({
        status: "ERR",
        message: "Không có dữ liệu nào được thay đổi!",
      });
    }
    const productId = req.params.id;
    const response = await ProductService.updateProduct(
      req.body,
      productId,
      imageFile
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
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

module.exports = {
  createProduct,
  addThumbnail,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
