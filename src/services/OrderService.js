// const Order = require("../models/OrderModel");
// const { DateTime } = require("luxon");

import Order from "~/models/OrderModel";
import User from "~/models/UserModel";
import Product from "~/models/ProductModel";
import { DateTime } from "luxon";
import mongoose from "mongoose";

const createOrder = (data) => {
  return new Promise(async (resolve, reject) => {
    const { customerId, products, totalAmount, shippingFee, note, paymentMethod, address } = data;

    try {
      // Kiểm tra người dùng
      const user = await User.findById(customerId);
      if (!user) {
        return reject(new Error("Người dùng không tồn tại"));
      }

      // Duyệt qua từng sản phẩm trong mảng `products`
      const insufficientStock = [];
      for (const product of products) {
        const { productId, quantity } = product;

        // Chuyển productId sang ObjectId nếu chưa phải là ObjectId
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Tìm sản phẩm trong cơ sở dữ liệu bằng `productId`
        const existingProduct = await Product.findById(productObjectId);
        console.log("Sản phẩm tìm thấy:", existingProduct);

        try {
          if (!existingProduct) {
            insufficientStock.push(`Sản phẩm với ID ${productId} không tồn tại`);
          } else {
            // Kiểm tra số lượng tồn kho
            if (existingProduct.quantity < quantity) {
              insufficientStock.push(`Không đủ số lượng cho sản phẩm: ${existingProduct.name}`);
            }
          }
        } catch (error) {
          console.error("Lỗi khi tìm sản phẩm:", error);
          insufficientStock.push(`Lỗi khi tìm sản phẩm với ID ${productId}`);
        }
      }

      // Nếu có sản phẩm thiếu hàng, từ chối đơn hàng
      if (insufficientStock.length > 0) {
        return reject(new Error(`Không đủ số lượng cho các sản phẩm: ${insufficientStock.join(', ')}`));
      }

      // Nếu không có vấn đề về kho, tiếp tục tạo đơn hàng
      const orderDate = DateTime.local().toISO();
      const deliveryDate = DateTime.fromISO(orderDate).plus({ minutes: 30 }).toISO();
      const { name, phone } = user;

      // Tạo đơn hàng
      const newOrder = await Order.create({
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
      });
      console.log('New Order created:', newOrder);

      // Trừ số lượng sản phẩm trong kho
      for (const product of products) {
        const { productId, quantity } = product;

        // Cập nhật số lượng tồn kho của sản phẩm
        await Product.updateOne(
          { _id: productId },
          { $inc: { quantity: -quantity } } // Giảm số lượng trong kho
        );
        console.log(`Đã trừ ${quantity} sản phẩm với ID ${productId} khỏi kho`);
      }

      // Xóa giỏ hàng của người dùng sau khi tạo đơn hàng
      await User.updateOne({ _id: customerId }, { $set: { cart: [] } });
      console.log('User cart cleared for user:', customerId);

      resolve({
        status: "OK",
        message: "Thêm đơn hàng thành công!",
        data: newOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      reject(error);
    }
  });
};



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
  getOrderByUser,
  completeOrder,
};
