import Review from '../models/ReviewModel.js';
import Product from '../models/ProductModel.js';
import Service from '../models/ServiceModel.js';

const createReview = async (newData) => {
  let entity;
  // console.log("newData: ", newData)
  if (newData.type === 'product') {
    entity = await Product.findById(newData.entityId);
  } 
  else if (newData.type === 'service') {
    entity = await Service.findById(newData.entityId);
  }
 
  if (!entity) {
    throw new Error('Sản phẩm hoặc dịch vụ không tồn tại');
  }

  try {
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
    throw new Error('Lỗi khi lưu đánh giá: ' + error.message);
  }
};


const getReviews = async (entityId, type) => {
  return await Review.find({ entityId, type });
};

export{
  createReview,
  getReviews
}


