
import * as OrderService from "~/services/OrderService";

const createOrder = async (req, res) => {
  console.log("controller", typeof req.body.products);
  
  try {
    const response = await OrderService.createOrder(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error creating order:", error); // Log lỗi chi tiết
    return res.status(500).json({
      message: "Đã có lỗi xảy ra khi tạo đơn hàng",
      error: error.message, // Trả về thông tin lỗi chi tiết
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
