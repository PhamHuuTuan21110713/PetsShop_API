
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

// const getAllOrder = async (req, res) => {
//   const { page = 1, limit = 10, filters } = req.query;  // Lấy filters từ body

//   try {
//     // Gọi service để lấy kết quả
//     const result = await OrderService.getAllOrder(page, limit, filters);

//     // Chuyển tiếp kết quả từ service ra client
//     res.status(200).json(result);  // Trả nguyên result về cho client
//   } catch (error) {
//     res.status(500).json({
//       status: "ERR",
//       message: error.message || "Đã có lỗi xảy ra"
//     });
//   }
// };

const getAllOrder = async (req, res) => {
  const { page = 1, limit = 10, filters } = req.query;  // Lấy filters từ query

  // Kiểm tra và chuyển filters thành object nếu có
  let parsedFilters = {};
  if (filters) {
    try {
      parsedFilters = JSON.parse(filters);  // Chuyển filters từ chuỗi JSON sang object
    } catch (error) {
      return res.status(400).json({
        status: "ERR",
        message: "Filters không hợp lệ"
      });
    }
  }

  try {
    // Gọi service để lấy kết quả
    const result = await OrderService.getAllOrder(page, limit, parsedFilters);

    // Trả kết quả về cho client
    res.status(200).json(result);  // Trả nguyên result về cho client
  } catch (error) {
    res.status(500).json({
      status: "ERR",
      message: error.message || "Đã có lỗi xảy ra"
    });
  }
};


const getOrderByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { filter = "{}", finding = "" } = req.query;
    // console.log("finding", finding);
    const response = await OrderService.getOrderByUser(userId, filter, finding);

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: error,
    });
  }
};

const updateOrderByUser = async (req, res) => {
  // const userId = req.params.id;
  const { orderId, status, paymentStatus } = req.body;
  console.log("ỏderid", orderId);
  console.log("status", status);
  try {
    // Kiểm tra xem trạng thái có hợp lệ không
    if (!status || !['dxl', 'dg', 'tc', 'hbs', 'hbb'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Gọi service để cập nhật trạng thái đơn hàng
    const updatedOrder = await OrderService.updateStatus(orderId, status, paymentStatus);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    // Trả về thông tin đơn hàng đã được cập nhật
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
}

  // Controller cập nhật trạng thái đơn hàng
  const updateOrder = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    console.log("du lieu: ", id, status);


    try {
      // Kiểm tra xem trạng thái có hợp lệ không
      if (!status || !['dxl', 'dg', 'tc', 'hbs', 'hbb'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }

      // Gọi service để cập nhật trạng thái đơn hàng
      const updatedOrder = await OrderService.updateStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
      }

      // Trả về thông tin đơn hàng đã được cập nhật
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
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
    getAllOrder,
    getOrderByUser,
    updateOrder,
    completeOrder,
    updateOrderByUser
  }
