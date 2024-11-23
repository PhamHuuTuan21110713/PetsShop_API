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
