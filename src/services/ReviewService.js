import Review from '../models/ReviewModel.js';
import Product from '../models/ProductModel.js';
import Order from '../models/OrderModel.js';
import Booking from '../models/BookingModel.js';
import Service from '../models/ServiceModel.js';


// import Product from "../models/ProductModel.js";
// import Service from "../models/ServiceModel.js";
// import Review from "../models/ReviewModel.js";
// import { checkIfUserHasPurchasedProduct } from './utils'; // Giả sử bạn có hàm này để kiểm tra người dùng đã mua sản phẩm chưa

// Tạo review và cập nhật rating
const createReview = async (newData) => {
  const { userId, type, entityId, rating, comment } = newData;

  console.log("Thông tin nhận được: ", userId, type, entityId);

  let entity;

  // Kiểm tra sản phẩm hoặc dịch vụ
  if (type === 'product') {
    entity = await Product.findById(entityId); // entityId là productId
  } else if (type === 'service') {
    entity = await Service.findById(entityId); // entityId là serviceId
  }
  

  // Nếu không tìm thấy sản phẩm/dịch vụ
  if (!entity) {
    return { 
      status: "ERROR", 
      message: "Sản phẩm hoặc dịch vụ không tồn tại" 
    };
  }

  try {
    // Kiểm tra xem người dùng đã mua sản phẩm/dịch vụ chưa
    const hasPurchased = await checkIfUserHasPurchasedProduct(userId, entityId, type);
    if (!hasPurchased) {
      return {
        status: "ERROR",
        message: "Bạn phải mua sản phẩm/dịch vụ này mới có thể viết đánh giá."
      };
    }

    console.log("newData", newData);
    
    // Tạo review mới
    const newReview = await Review.create(newData);

    // Cập nhật rating cho sản phẩm hoặc dịch vụ sau khi review mới được thêm
    if (type === 'product') {
      await updateProductRating(entityId); // Cập nhật rating cho sản phẩm
    } 

    return {
      status: "OK",
      message: "Thêm đánh giá thành công!",
      data: newReview,
    };
    
  } catch (error) {
    console.error("Lỗi khi lưu đánh giá:", error.message);
    return {
      status: "ERROR",
      message: `Lỗi khi lưu đánh giá: ${error.message}`,
    };
  }
};

// Hàm cập nhật rating cho sản phẩm
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ entityId: productId, type: 'product' });
    if (reviews.length === 0) {
      return await Product.findByIdAndUpdate(productId, { rating: 0 }, { new: true });
    }

    const ratings = reviews.map(review => review.rating);
    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = totalRating / ratings.length;

    return await Product.findByIdAndUpdate(productId, { rating: averageRating }, { new: true });
  } catch (error) {
    console.error("Lỗi khi cập nhật rating sản phẩm:", error.message);
    throw new Error("Không thể cập nhật rating cho sản phẩm.");
  }
};


const getReviews = async (entityId, type) => {
  return await Review.find({ entityId, type });
};

const checkIfUserHasPurchasedProduct = async (userId, entityId, type) => {
  try {
    if (type === 'product') {
      // Kiểm tra sản phẩm trong đơn hàng của người dùng
      const orders = await Order.find({ customerId: userId });
      
      // Duyệt qua từng đơn hàng để kiểm tra xem sản phẩm có tồn tại trong đơn hàng hay không
      for (const order of orders) {
        const purchasedProduct = order.products.find(product => product.productId.toString() === entityId.toString());
        
        if (purchasedProduct) {
          // Nếu sản phẩm có trong đơn hàng, nghĩa là người dùng đã mua sản phẩm này
          return true;
        }
      }
    } 
    else if (type === 'service') {
      // Kiểm tra dịch vụ trong booking của người dùng
      const bookings = await Booking.find({ userId: userId });
      
      // Duyệt qua các booking để kiểm tra xem dịch vụ có tồn tại trong booking hay không
      for (const booking of bookings) {
        if (booking.serviceId.toString() === entityId.toString()) {
          // Nếu dịch vụ có trong booking, nghĩa là người dùng đã đặt dịch vụ này
          return true;
        }
      }
    }
    
    // Nếu không tìm thấy sản phẩm hoặc dịch vụ trong các đơn hàng/booking, trả về false
    return false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đơn hàng hoặc booking:", error);
    return false;
  }
};


export{
  createReview,
  getReviews
}


