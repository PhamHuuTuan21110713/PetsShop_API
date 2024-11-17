import Review from '../models/ReviewModel.js';
import Product from '../models/ProductModel.js';
import Order from '../models/OrderModel.js';
//import Service from '../models/Service.js';

const createReview = async (newData) => {
  const { userId, type, entityId } = newData;

  console.log("Thông tin nhận được: ", userId, type, entityId);
  

  let entity;

  // Kiểm tra sản phẩm hoặc dịch vụ (nếu có)
  if (type === 'product') {
    entity = await Product.findById(entityId); // entityId là productId ở đây
  } 
  // else if (type === 'service') {
  //   entity = await Service.findById(entityId); // Thêm logic cho dịch vụ nếu cần
  // }

  if (!entity) {
    return { 
      status: "ERROR", 
      message: "Sản phẩm hoặc dịch vụ không tồn tại" 
    };
  }

  try {
    // Kiểm tra xem người dùng đã mua sản phẩm chưa
    const hasPurchased = await checkIfUserHasPurchasedProduct(userId, entityId);
    if (!hasPurchased) {
      return {
        status: "ERROR",
        message: "Bạn phải mua sản phẩm này mới có thể viết đánh giá."
      };
    }

    // Nếu người dùng đã mua, tiếp tục tạo review
    const newReview = await Review.create(newData);

    // Kiểm tra xem đánh giá đã được tạo thành công
    if (newReview) {
      return {
        status: "OK",
        message: "Thêm đánh giá thành công!",
        data: newReview,
      };
    }
  } catch (error) {
    console.error("Lỗi khi lưu đánh giá:", error.message);
    return {
      status: "ERROR",
      message: `Lỗi khi lưu đánh giá: ${error.message}`,
    };
  }
};


const getReviews = async (entityId, type) => {
  return await Review.find({ entityId, type });
};

const checkIfUserHasPurchasedProduct = async (userId, productId) => {
  try {
    // Tìm kiếm đơn hàng của người dùng
    const orders = await Order.find({ customerId: userId });

    // Duyệt qua từng đơn hàng để kiểm tra xem sản phẩm có tồn tại trong đơn hàng hay không
    for (const order of orders) {
      const purchasedProduct = order.products.find(product => product.productId.toString() === productId.toString());
      
      if (purchasedProduct) {
        // Nếu sản phẩm có trong đơn hàng, nghĩa là người dùng đã mua sản phẩm này
        return true;
      }
    }

    // Nếu không tìm thấy sản phẩm trong các đơn hàng, trả về false
    return false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đơn hàng:", error);
    return false;
  }
};


export{
  createReview,
  getReviews
}


