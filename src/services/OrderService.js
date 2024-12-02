// const Order = require("../models/OrderModel");
// const { DateTime } = require("luxon");

import Order from "~/models/OrderModel";
import User from "~/models/UserModel";
import Product from "~/models/ProductModel";
import { DateTime } from "luxon";
import mongoose from "mongoose";

const createOrder = async (data) => {
  const { customerId, products, totalAmount, shippingFee, note, paymentMethod, address } = data;

  const session = await mongoose.startSession();  // Khởi tạo phiên giao dịch (transaction)
  session.startTransaction();

  try {
    // Kiểm tra người dùng
    const user = await User.findById(customerId).session(session);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Kiểm tra tồn kho cho tất cả sản phẩm
    const insufficientStock = [];
    const productIds = products.map(product => product.productId);
    const existingProducts = await Product.find({ _id: { $in: productIds } }).session(session);

    for (const product of products) {
      const existingProduct = existingProducts.find(p => p._id.toString() === product.productId);
      if (!existingProduct) {
        insufficientStock.push(`Sản phẩm với ID ${product.productId} không tồn tại`);
      } else if (existingProduct.quantity < product.quantity) {
        insufficientStock.push(`Không đủ số lượng cho sản phẩm: ${existingProduct.name}`);
      }
    }

    if (insufficientStock.length > 0) {
      throw new Error(`Không đủ số lượng cho các sản phẩm: ${insufficientStock.join(', ')}`);
    }

    // Tiến hành tạo đơn hàng
    const orderDate = DateTime.local().toISO();
    const deliveryDate = DateTime.fromISO(orderDate).plus({ minutes: 30 }).toISO();
    const { name, phone } = user;

    const newOrder = await Order.create(
      [{
        customerId,
        name,
        phone,
        address,
        orderDate,
        deliveryDate,
        products,
        totalPrice: totalAmount,
        shippingFee,
        note,
        paymentMethod,
      }],
      { session } // Đảm bảo tạo đơn hàng trong cùng một session (giao dịch)
    );

    const updatePromises = products.map(product =>
      Product.updateOne(
        { _id: product.productId },
        {
          $inc: {
            quantity: -product.quantity,  // Giảm quantity theo số lượng bán
            sold: product.quantity        // Tăng sold theo số lượng bán
          }
        },
        { session }
      )
    );

    await Promise.all(updatePromises);

    // Xóa các sản phẩm đã đặt khỏi giỏ hàng của người dùng
    const productIdsToRemove = products.map(product => product.productId);
    await User.updateOne(
      { _id: customerId },
      { $pull: { cart: { productId: { $in: productIdsToRemove } } } }, // Xóa sản phẩm khỏi giỏ hàng
      { session }
    );

    // Commit giao dịch nếu tất cả thành công
    await session.commitTransaction();
    session.endSession();

    return {
      status: "OK",
      message: "Thêm đơn hàng thành công!",
      data: newOrder[0],  // Trả về đơn hàng vừa tạo
    };

  } catch (error) {
    // Rollback giao dịch nếu có lỗi xảy ra
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error creating order:", error);
    throw error;  // Ném lỗi để phía client xử lý
  }
};

const getAllOrder = async (page = 1, limit, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    let query = { state: true };  // Mặc định luôn lọc đơn hàng có state === true

    // Kiểm tra và áp dụng từng điều kiện lọc nếu có
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.month && filters.year) {
      query.orderDate = {
        $gte: new Date(filters.year, filters.month - 1, 1),
        $lt: new Date(filters.year, filters.month, 0)
      };
    }

    if (filters.year && !filters.month) {  // Nếu chỉ có year mà không có month
      query.orderDate = {
        $gte: new Date(filters.year, 0, 1),
        $lt: new Date(filters.year + 1, 0, 1)
      };
    }

    if (filters.orderId) {
      query._id = filters.orderId;
    }

    // Truy vấn database với điều kiện query đã tạo
    const orders = await Order.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ orderDate: -1 });

    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      status: "OK",
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount
      }
    };

  } catch (error) {
    console.error("Error in getAllOrder:", error); // Log lỗi chi tiết
    throw new Error("Lỗi khi lấy đơn hàng: " + error.message);
  }
};




// const getAllOrder = async (page = 1, limit = 10, filters = {}) => {
//   try {
//     const skip = (page - 1) * limit;
//     let query = {};

//     // Áp dụng các filters
//     if (filters.status) {
//       query.status = filters.status;
//     }

//     if (filters.month) {
//       query.orderDate = { 
//         $gte: new Date(filters.year, filters.month - 1, 1), 
//         $lt: new Date(filters.year, filters.month, 0) 
//       };
//     }

//     if (filters.year) {
//       query.orderDate = { 
//         $gte: new Date(filters.year, 0, 1), 
//         $lt: new Date(filters.year + 1, 0, 1) 
//       };
//     }

//     if (filters.orderId) {
//       query._id = filters.orderId;
//     }

//     // Truy vấn database
//     const orders = await Order.find(query)
//       .skip(skip)
//       .limit(limit)
//       .sort({ orderDate: -1 });

//     const totalCount = await Order.countDocuments(query);
//     const totalPages = Math.ceil(totalCount / limit);

//     return {
//       status: "OK",
//       data: orders,
//       pagination: {
//         currentPage: page,
//         totalPages: totalPages,
//         totalCount: totalCount
//       }
//     };

//   } catch (error) {
//     console.error("Error in getAllOrder:", error); // Log lỗi chi tiết
//     throw new Error("Lỗi khi lấy đơn hàng: " + error.message);
//   }
// };




const getOrderByUser = (userId, filter, finding) => {
  let _filter = JSON.parse(filter);
  return new Promise(async (resolve, reject) => {
    try {
      if (_filter.year) {
        // console.log("_ffff: ", _filter)
        const startOfYear = new Date(`${parseInt(_filter.year)}-01-01T17:46:04.630+00:00`);
        const endOfYear = new Date(`${parseInt(parseInt(_filter.year) + 1)}-01-01T17:46:04.630+00:00`);
        _filter = {
          ..._filter,
          "orderDate": {
            $gte: startOfYear,
            $lt: endOfYear
          }
        }
        delete _filter.year
      }

      console.log("filter: ", _filter)
      if(_filter._id) {
        const id = new mongoose.Types.ObjectId(_filter._id)
        _filter = {
          ..._filter,
          _id: id
        }
      }
      const orders = await Order.aggregate([
        {
          $match: {
            customerId: userId,
            ..._filter
          }
        },
        {
          $addFields: {
            products: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  productId: { $toObjectId: "$$product.productId" }, // Chuyển sang ObjectId
                  quantity: "$$product.quantity",
                  price: "$$product.price",
                },
              },
            },
          },
        },

        // Bước 3: Kết nối với bảng `products` để lấy thông tin chi tiết
        {
          $lookup: {
            from: "products", // Tên collection của Product
            localField: "products.productId", // Trường productId trong mảng products
            foreignField: "_id", // Trường _id của Product
            as: "productDetails", // Kết quả sẽ gắn vào trường này
          },
        },
        // Bước 4: Lọc theo tên sản phẩm
        {
          $match: {
            "productDetails.name": { $regex: finding, $options: "i" } // Lọc theo tên sản phẩm
          }
        },

        {
          $project: {
            _id: 1,
            customerId: 1,
            name: 1,
            phone: 1,
            address: 1,
            orderDate: 1,
            deliveryDate: 1,
            products: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  productId: "$$product.productId",
                  quantity: "$$product.quantity",
                  price: "$$product.price",
                  details: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "detail",
                          cond: {
                            $eq: ["$$detail._id", "$$product.productId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
            status: 1,
            shippingFee: 1,
            totalPrice: 1,
            note: 1,
            paymentMethod: 1,
            state: 1,
          },
        },
      ])
      if (orders !== null && orders.length > 0) {
        resolve({
          status: "OK",
          message: "Lấy đơn hàng thành công!",
          data: orders,
        });
      } else {
        resolve({
          status: "OK",
          message: "Chưa có đơn hàng nào!",
          data: [],
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateStatus = async (id, status, paymentStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm và cập nhật đơn hàng theo ID
      const updatedOrder = await Order.findById(id);

      // Nếu không tìm thấy đơn hàng
      if (!updatedOrder) {
        resolve({
          status: "ERR",
          message: "Đơn hàng không tồn tại!",
        });
      }

      updatedOrder.status = status
      updatedOrder.paymentStatus = paymentStatus
      await updatedOrder.save();

      resolve({
        status: "OK",
        message: "Đã hoàn thành đơn hàng!",
        data: updatedOrder
      });
    } catch (error) {
      reject(error);
    }
  })
};

const completeOrder = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        resolve({
          status: "ERR",
          message: "Đơn hàng không tồn tại!",
        });
      }
      order.isCompleted = true;
      await order.save();
      resolve({
        status: "OK",
        message: "Đã hoàn thành đơn hàng!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export {
  createOrder,
  getAllOrder,
  getOrderByUser,
  updateStatus,
  completeOrder,
};
