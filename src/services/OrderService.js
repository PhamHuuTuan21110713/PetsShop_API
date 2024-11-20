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



const getOrderByUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find({ customerId: userId }).sort({
        orderDate: -1,
      });
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
