// const Product = require("../models/ProductModel");
// const cloudinary = require("cloudinary").v2;
import Product from "~/models/ProductModel";
import Promotion from "~/models/Promotion";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

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

      // Thêm điều kiện lọc theo productId nếu có
      if (productId && productId.trim() !== "") { // Kiểm tra nếu productId không phải là chuỗi rỗng
        filter._id = productId; // Lọc theo _id nếu productId có giá trị
      } else {
        // Nếu productId không có, áp dụng các điều kiện lọc khác
        
        // Lọc theo giá
        filter.price = { $gte: price_min, $lte: price_max };

        // Lọc theo rating
        filter.rating = { $gte: rating_filter };

        // Lọc theo tên (sử dụng RegExp để tìm kiếm không phân biệt hoa/thường)
        if (name) {
          filter.name = { $regex: new RegExp(name, "i") };
        }

        // Lọc theo type (nếu có type)
        if (type) {
          filter.type = type;
        } else {
          filter.type = { $exists: true }; // Nếu không có type thì tìm tất cả sản phẩm có type
        }
      }

      const counter = await Product.countDocuments(filter); // Đếm số sản phẩm thỏa mãn filter

      let products;
      if (sort_by && order) {
        const sortOrder = order === "desc" ? -1 : 1;
        products = await Product.find(filter)
          .sort({ [sort_by]: sortOrder })
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


// const getProducts = (
//   limit,
//   page,
//   sort_by,
//   order,
//   price_min,
//   price_max,
//   rating_filter,
//   name,
//   type
// ) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const filter = {
//         price: { $gte: price_min, $lte: price_max },
//         rating: { $gte: rating_filter },
//         name: { $regex: new RegExp(name, "i") },
//         type: type || { $exists: true },
//       };
//       const counter = await Product.countDocuments(filter);
//       let products;
//       if (sort_by && order) {
//         // Chuyển đổi order từ 'asc' và 'desc' thành số 1 và -1
//         const sortOrder = order === 'desc' ? -1 : 1;
//         products = await Product.find(filter)
//           .sort({ [sort_by]: sortOrder })
//           .limit(limit)
//           .skip(limit * (page - 1));
//       } else {
//         products = await Product.find(filter)
//           .limit(limit)
//           .skip(limit * (page - 1));
//       }
//       if (products) {
//         resolve({
//           status: "OK",
//           message: "Lấy danh sách sản phẩm thành công!",
//           data: {
//             products,
//             currentPage: Number(page),
//             totalPage: Math.ceil(counter / limit),
//             totalProduct: counter,
//           },
//         });
//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// const getBestSellingProducts = async (page = 1, limit = 10) => {
//   try {
//       const skip = (page - 1) * limit;

//       const filteredProducts = await Product.find({ sold: { $gt: 20 } })
//           .sort({ sold: -1 }) 
//           .skip(skip) 
//           .limit(limit); 

//       const total = await Product.countDocuments({ sold: { $gt: 20 } }); 

//       return {
//           total,
//           products: filteredProducts,
//           currentPage: Number(page),
//           totalPages: Math.ceil(total / limit),
//       };
//   } catch (error) {
//       throw new Error('Không thể lấy danh sách sản phẩm: ' + error.message);
//   }
// };

const getBestSellingProducts = async (page = 1, limit = 10) => {
  let isOnlyPromotion = false; // Biến này có thể được thay đổi nếu muốn chỉ lấy sản phẩm có khuyến mãi
  try {
    const skip = (page - 1) * limit;  // Tính toán số sản phẩm bỏ qua (cho phân trang)

    // Kiểm tra limit và page để đảm bảo chúng hợp lệ
    if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
      throw new Error("Invalid page or limit");
    }

    // Tạo pipeline aggregate cho MongoDB
    const pipeline = [
      {
        $match: {
          sold: { $gt: 20 },  // Lọc sản phẩm có số lượng bán > 20
          state: true,  // Lọc sản phẩm đang hoạt động
        }
      },
      {
        $lookup: {
          from: 'promotions',  // Kết nối với collection 'promotions'
          let: { productId: "$_id" },
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
        $match: {
          // Giữ lại tất cả sản phẩm, chỉ thêm điều kiện này nếu muốn lọc sản phẩm có khuyến mãi
          // $or: [
          //   { hasPromotion: true },  // Nếu có khuyến mãi
          //   { promotions: { $exists: true, $not: { $size: 0 } } }  // Nếu mảng 'promotions' tồn tại và không rỗng
          // ]
        }
      },
      {
        $sort: { sold: -1 },  // Sắp xếp sản phẩm theo số lượng bán giảm dần
      },
      {
        $skip: skip,  // Phân trang: bỏ qua số lượng sản phẩm theo `skip`
      },
      {
        $limit: limit,  // Giới hạn số lượng sản phẩm trả về
      },
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
          promotions: 1,  // Trả về thông tin khuyến mãi của sản phẩm
          hasPromotion: 1  // Trả về thông tin về khuyến mãi
        }
      }
    ];

    // Thực hiện truy vấn với pipeline đã tạo
    const products = await Product.aggregate(pipeline);

    // Tính tổng số sản phẩm thỏa mãn điều kiện
    const total = await Product.countDocuments({
      sold: { $gt: 20 },
      state: true
    });

    // Trả về kết quả bao gồm tổng số sản phẩm và danh sách sản phẩm
    return {
      total,
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    // Xử lý lỗi khi không thể truy vấn dữ liệu
    throw new Error('Không thể lấy danh sách sản phẩm: ' + error.message);
  }
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

export {
  createProduct,
  addThumbnail,
  getProducts,
  getBestSellingProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
