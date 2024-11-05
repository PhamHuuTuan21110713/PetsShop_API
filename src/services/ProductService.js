// const Product = require("../models/ProductModel");
// const cloudinary = require("cloudinary").v2;
import Product from "~/models/ProductModel";
import { v2 as cloudinary } from "cloudinary";

const createProduct = (data, imageFile) => {
  return new Promise(async (resolve, reject) => {
    const {
      name,
      desc,
      type,
      price,
      price_before_discount,
      quantity,
      sold,
      view,
      rating,
      size,
      category
    } = data;
    try {
      const checkedProduct = await Product.findOne({ name });
      if (checkedProduct) {
        if (imageFile) {
          cloudinary.uploader.destroy(imageFile.filename);
        }
        resolve({
          status: "ERR",
          message: "Sản phẩm đã tồn tại!",
        });
      } else {
        const img = imageFile?.path;
        const imgPath = imageFile?.filename;
        const newSize = size || ["S", "M", "L", "XL"];
        const newProduct = await Product.create({
          name,
          desc,
          type,
          price,
          price_before_discount,
          quantity,
          sold,
          view,
          rating,
          img,
          imgPath,
          size: newSize,
          category
        });
        if (newProduct) {
          resolve({
            status: "OK",
            message: "Thêm sản phẩm thành công!",
            data: newProduct,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const addThumbnail = (productId, imageFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);
      if (product) {
        const img = imageFile?.path;
        const imgPath = imageFile?.filename;
        thumbnail = product.thumbnail;
        thumbnail.push({ url: img, path: imgPath });
        newData = { ...product, thumbnail };

        updatedProduct = await Product.findByIdAndUpdate(productId, newData, {
          new: true,
        });
        resolve({
          status: "OK",
          message: "Thêm thumbnail thành công!",
          data: updatedProduct,
        });
      } else {
        if (imageFile) {
          cloudinary.uploader.destroy(imageFile.filename);
        }
        resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getProducts = (
  limit,
  page,
  sort_by,
  order,
  price_min,
  price_max,
  rating_filter,
  name,
  type
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = {
        price: { $gte: price_min, $lte: price_max },
        rating: { $gte: rating_filter },
        name: { $regex: new RegExp(name, "i") },
        type: type || { $exists: true },
      };
      const counter = await Product.countDocuments(filter);
      let products;
      if (sort_by && order) {
        products = await Product.find(filter)
          .sort({ [sort_by]: order })
          .limit(limit)
          .skip(limit * (page - 1));
      } else {
        products = await Product.find(filter)
          .limit(limit)
          .skip(limit * (page - 1));
      }
      if (products) {
        resolve({
          status: "OK",
          message: "Lấy danh sách sản phẩm thành công!",
          data: {
            products,
            currentPage: Number(page),
            totalPage: Math.ceil(counter / limit),
            totalProduct: counter,
          },
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getBestSellingProducts = async (page = 1, limit = 10) => {
  try {
      const skip = (page - 1) * limit;

      const filteredProducts = await Product.find({ sold: { $gt: 20 } })
          .sort({ sold: -1 }) 
          .skip(skip) 
          .limit(limit); 

      const total = await Product.countDocuments({ sold: { $gt: 20 } }); 

      return {
          total,
          products: filteredProducts,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
      };
  } catch (error) {
      throw new Error('Không thể lấy danh sách sản phẩm: ' + error.message);
  }
};

const getProductById = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);
      if (product) {
        resolve({
          status: "OK",
          message: "Lấy thông tin sản phẩm thành công!",
          data: product,
        });
      } else {
        resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};


const updateProduct = (data, productId, imageFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);
      if (product) {
        const img = imageFile?.path;
        const imgPath = imageFile?.filename;
        newData = { ...data, img, imgPath };

        if (product?.imgPath && imageFile) {
          var imageID = product.imgPath;
          if (imageID) cloudinary.uploader.destroy(imageID);
        }

        updatedProduct = await Product.findByIdAndUpdate(productId, newData, {
          new: true,
        });
        resolve({
          status: "OK",
          message: "Cập nhật sản phẩm thành công!",
          data: updatedProduct,
        });
      } else {
        if (imageFile) {
          cloudinary.uploader.destroy(imageFile.filename);
        }
        resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteProduct = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);
      if (product) {
        if (product?.imgPath) {
          var imgPath = product.imgPath;
          if (imgPath) cloudinary.uploader.destroy(imgPath);
        }
        await Product.findByIdAndDelete(productId);
        resolve({
          status: "OK",
          message: "Xóa sản phẩm thành công!",
        });
      } else {
        resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
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
