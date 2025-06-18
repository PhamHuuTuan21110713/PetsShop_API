// const Product = require("../models/ProductModel");
// const cloudinary = require("cloudinary").v2;
import Product from "../models/ProductModel.js";
// import Promotion from "~/models/Promotion";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Type from "../models/TypeProductModel.js";
import Order from "../models/OrderModel.js";
import GerminiService from "./GerminiService.js";

const createProduct = (data, imageFile) => {
  return new Promise(async (resolve, reject) => {
    const {
      name,
      desc,
      type,
      price,
      quantity,
      sold,
      view,
      rating,
      //size,
      categoryId
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
        //const newSize = size || ["S", "M", "L", "XL"];
        const newProduct = await Product.create({
          name,
          desc,
          type,
          price,
          quantity,
          sold,
          view,
          rating,
          img,
          imgPath,
          //size: newSize,
          categoryId
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
      console.log("san pham them anh: ", product);

      if (product) {
        const imgUrl = imageFile?.path;
        const imgPath = imageFile?.filename;
        let thumbnail = product.thumbnail || []; // Khởi tạo nếu chưa có
        thumbnail.push({ url: imgUrl, path: imgPath });
        const newData = { ...product, thumbnail };

        const updatedProduct = await Product.findByIdAndUpdate(productId, newData, {
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
  type,
  productId // Thêm tham số id
) => {
  return new Promise(async (resolve, reject) => {
    console.log("ProductId in service:", productId); // Kiểm tra giá trị của productId

    try {
      const filter = {};

      // Kiểm tra và thêm điều kiện lọc theo productId nếu có
      if (productId && productId.trim() !== "") {
        filter._id = productId; // Lọc theo _id nếu productId có giá trị
      } else {
        // Lọc theo giá
        if (price_min !== undefined && price_max !== undefined) {
          filter.price = { $gte: price_min, $lte: price_max };
        }

        // Lọc theo rating
        if (rating_filter !== undefined) {
          filter.rating = { $gte: rating_filter };
        }

        // Lọc theo tên (sử dụng RegExp để tìm kiếm không phân biệt hoa/thường)
        if (name) {
          const finded_name = await GerminiService.findRelatedName(name);
          // console.log("germini result: ", result)
          // filter.name = { $regex: new RegExp(name, "i") };
          filter.$or = [
            { name: { $regex: new RegExp(name, "i") } },         // lọc theo tên người dùng nhập
            { name: { $regex: new RegExp(finded_name, "i") } },  // lọc theo tên sửa bởi Gemini
          ];
        }

        // Lọc theo type (nếu có type)
        if (type) {
          filter.type = type;
        } else {
          filter.type = { $exists: true }; // Nếu không có type thì tìm tất cả sản phẩm có type
        }
      }

      const counter = await Product.countDocuments(filter); // Đếm số sản phẩm thỏa mãn filter

      // Xử lý sắp xếp nếu có
      const sortOrder = order === 'desc' ? -1 : 1;
      const validSortFields = ['name', 'price', 'sold', 'rating'];  // Các trường hợp lệ để sort
      const sortPipeline = validSortFields.includes(sort_by) ? { [sort_by]: sortOrder } : { name: 1 }; // Mặc định sắp xếp theo tên

      // Tạo pipeline aggregate cho MongoDB
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'promotions',
            let: { productId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$$productId", "$applicableProducts"] },
                      { $lte: ["$startDate", new Date()] },
                      { $gte: ["$endDate", new Date()] }
                    ]
                  }
                }
              }
            ],
            as: 'promotions'
          }
        },
        {
          $addFields: {
            hasPromotion: { $gt: [{ $size: "$promotions" }, 0] }
          }
        },
        { $sort: sortPipeline },
        { $skip: limit * (page - 1) },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            sold: 1,
            rating: 1,
            desc: 1,
            quantity: 1,
            type: 1,
            state: 1,
            img: 1,
            categoryId: 1,
            promotions: 1,
            hasPromotion: 1,
            createdAt: 1
          }
        }
      ];

      // Thực hiện truy vấn với pipeline đã tạo
      const products = await Product.aggregate(pipeline);

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
      console.error("Error fetching products:", error);
      reject(error);
    }
  });
};


const getBestSellingProducts = async (page = 1, limit = 10) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const skip = (page - 1) * limit;

  const pipeline = [
    // Chỉ lấy đơn hàng hoàn tất trong tháng hiện tại
    {
      $match: {
        orderDate: { $gte: firstDay, $lte: lastDay },
        state: true,
        status: "tc"
      }
    },
    // Tách từng sản phẩm ra
    { $unwind: "$products" },
    // Nhóm theo productId
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" }
      }
    },
    // Chuyển _id (string) thành ObjectId để join
    {
      $addFields: {
        productObjectId: { $toObjectId: "$_id" }
      }
    },
    // Sắp xếp theo số lượng bán
    { $sort: { totalSold: -1 } },
    { $skip: skip },
    { $limit: limit },
    // Join với bảng sản phẩm
    {
      $lookup: {
        from: "products",
        localField: "productObjectId",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    // Join với bảng khuyến mãi
    {
      $lookup: {
        from: "promotions",
        let: { productId: "$productObjectId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$productId", "$applicableProducts"] },
                  { $lte: ["$startDate", new Date()] },
                  { $gte: ["$endDate", new Date()] }
                ]
              }
            }
          }
        ],
        as: "promotions"
      }
    },
    // Gộp thông tin bán + khuyến mãi vào sản phẩm
    {
      $addFields: {
        "product.promotions": "$promotions",
        "product.totalSoldThisMonth": "$totalSold"
      }
    },
    // Trả về object sản phẩm hoàn chỉnh
    {
      $replaceRoot: { newRoot: "$product" }
    }
  ];

  // Chạy pipeline chính
  const results = await Order.aggregate(pipeline);

  // Đếm tổng số sản phẩm đã bán trong tháng
  const totalCountAgg = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: firstDay, $lte: lastDay },
        state: true,
        status: "tc"
      }
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId"
      }
    },
    { $count: "total" }
  ]);

  const total = totalCountAgg[0]?.total || 0;

  return {
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    products: results
  };
};


const getProductById = async (productId) => {
  console.log('Received productId:', productId);  // Kiểm tra giá trị productId đã nhận

  try {
    // Chuyển đổi productId từ chuỗi (string) thành ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Tạo pipeline aggregate cho MongoDB để lấy thông tin đầy đủ của sản phẩm
    const pipeline = [
      {
        $match: {
          _id: productObjectId,  // Lọc sản phẩm theo ID
          state: true,  // Lọc sản phẩm đang hoạt động
        }
      },
      {
        $lookup: {
          from: 'promotions',  // Kết nối với collection 'promotions'
          let: { productId: "$_id" },  // Truyền productId vào từ khóa let
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$productId", "$applicableProducts"] },  // Sản phẩm có trong danh sách áp dụng khuyến mãi
                    { $lte: ["$startDate", new Date()] },  // Khuyến mãi đang diễn ra
                    { $gte: ["$endDate", new Date()] }   // Khuyến mãi chưa kết thúc
                  ]
                }
              }
            }
          ],
          as: 'promotions'  // Trả về thông tin khuyến mãi cho mỗi sản phẩm
        }
      },
      {
        $addFields: {
          hasPromotion: { $gt: [{ $size: "$promotions" }, 0] }  // Kiểm tra nếu sản phẩm có khuyến mãi
        }
      },
      {
        $lookup: {
          from: "categories",  // Kết nối với collection categories để lấy tên thể loại sản phẩm
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: {
          path: "$category",  // Chuyển category thành một đối tượng duy nhất
          preserveNullAndEmptyArrays: true  // Nếu không có category, vẫn tiếp tục
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          desc: 1,  // Mô tả chi tiết của sản phẩm
          price: 1,
          quantity: 1,
          sold: 1,
          view: 1,
          rating: 1,
          type: 1,
          img: 1,
          imgPath: 1,
          thumbnail: 1,
          promotions: 1,  // Thông tin khuyến mãi của sản phẩm (nếu có)
          hasPromotion: 1  // Trả về thông tin về khuyến mãi
        }
      }
    ];

    // Thực hiện truy vấn với pipeline đã tạo
    const product = await Product.aggregate(pipeline);

    // Kiểm tra xem sản phẩm có tồn tại không
    if (product.length === 0) {
      return {
        status: "ERR",
        message: "Không tìm thấy sản phẩm!",
      };
    }

    // Tạo đối tượng kết quả
    return {
      status: "OK",
      message: "Lấy thông tin sản phẩm thành công!",
      data: product[0],  // Trả về sản phẩm đầu tiên trong danh sách (vì chúng ta chỉ tìm 1 sản phẩm theo ID)
    };

  } catch (error) {
    // Xử lý lỗi nếu có
    console.error('Error:', error);  // Log toàn bộ lỗi
    return {
      status: "ERR",
      message: "Lỗi khi truy vấn sản phẩm hoặc khuyến mãi.",
      error: error.message,
    };
  }
};



const updateProduct = (data, productId, imageFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("ProductId:", productId);  // Log ID sản phẩm

      const product = await Product.findById(productId);
      console.log("Product found:", product);  // Log sản phẩm

      if (!product) {
        // Nếu không tìm thấy sản phẩm, trả về lỗi chi tiết
        return reject(new Error("Không tìm thấy sản phẩm với ID này"));
      }

      const img = imageFile?.path;
      const imgPath = imageFile?.filename;
      const newData = { ...data, img, imgPath };

      if (product?.imgPath && imageFile) {
        var imageID = product.imgPath;
        if (imageID) cloudinary.uploader.destroy(imageID);
      }
      const updatedProduct = await Product.findByIdAndUpdate(productId, newData, { new: true });


      resolve({
        status: "OK",
        message: "Cập nhật sản phẩm thành công!",
        data: updatedProduct,
      });

    } catch (error) {
      console.error("Error in updateProduct:", error);  // Log lỗi
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

const createMany = (data) => {
  return new Promise(async (rs, rj) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

      const users = await Product.insertMany(data, { session });
      await session.commitTransaction();
      if (users.length === data.length) {
        rs({
          status: "OK",
          message: "Tất cả dữ liệu đã được thêm vào",
          data: users
        })
      } else if (users.length > 0) {
        rj({
          status: "ERR",
          message: "Có dữ liệu lỗi, không thể thêm",
          data: users
        })
      }
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      rj(err);
    } finally {
      session.endSession();
    }
  })
}

const getTypeProduct = async () => {
  try {
    const type = await Type.find();
    return {
      status: "OK",
      message: "Lấy type thành công",
      data: { type }
    }
  }

  catch (err) {
    throw new Error(`Lỗi khi lấy type: ${err.message}`)
  }
}

export {
  createProduct,
  addThumbnail,
  getProducts,
  getBestSellingProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createMany,
  getTypeProduct
};
