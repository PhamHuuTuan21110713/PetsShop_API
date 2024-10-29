const Order = require("../models/OrderModel");
const { DateTime } = require("luxon");

const createOrder = (data) => {
  return new Promise(async (resolve, reject) => {
    const { customerId, products, note, paymentMethod } = data;
    try {
      orderDate = DateTime.local().toISO();
      deliveryDate = DateTime.fromISO(orderDate).plus({ minutes: 30 }).toISO();
      const totalAmount = products.reduce(
        (acc, cur) => acc + cur.price * cur.quantity,
        0
      );
      const newOrder = await Order.create({
        customerId,
        orderDate,
        deliveryDate,
        products,
        totalAmount,
        note,
        paymentMethod,
      });
      if (newOrder) {
        resolve({
          status: "OK",
          message: "Thêm đơn hàng thành công!",
          data: newOrder,
        });
      }
    } catch (error) {
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

module.exports = {
  createOrder,
  getOrderByUser,
  completeOrder,
};
