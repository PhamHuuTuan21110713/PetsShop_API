// const OrderService = require("../services/OrderService");
import * as OrderService from "~/services/OrderService";

const createOrder = async (req, res) => {
  try {
    const response = await OrderService.createOrder(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getOrderByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await OrderService.getOrderByUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const completeOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const response = await OrderService.completeOrder(orderId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

export {
  createOrder,
  getOrderByUser,
  completeOrder,
};
