import Promotion from "~/models/Promotion";
import mongoose from "mongoose";
const getAllPromotions = (outdated, condition = {}) => {

    return new Promise(async (rs, rj) => {
        try {
            let promotions = null;
            const today = new Date();
            const filters = {}; // Mới khởi tạo object filters để xử lý từng trường hợp

            console.log("date service", outdated);
            
            // Xử lý `outdated`
            if (outdated === "true") {
                filters.$or = [
                    { startDate: { $gt: today } },
                    { endDate: { $lt: today } }
                ];
            } else if (outdated === "false") {
                filters.startDate = { $lte: today };
                filters.endDate = { $gte: today };
            }

            // Thêm các điều kiện từ `condition`
            if (condition.name) filters.name = condition.name;
            if (condition.promotionId) filters._id = condition.promotionId;
            if (condition.type && condition.type !== "none") filters.type = condition.type;
            
            //filters.state = true;  // Điều kiện luôn có trường `state` là `true`

            // Tạo query MongoDB
            promotions = await Promotion.find(filters);

            if (promotions) {
                rs({
                    status: "OK",
                    message: "Lấy danh sách chương trình khuyến mãi thành công",
                    data: promotions
                });
            }
        } catch (err) {
            rj(err);
        }
    });
};


const getPromotionById = (id) => {
    const idobj = new mongoose.Types.ObjectId(id);
    return new Promise(async (rs, rj) => {
        try {
            // const data = await Promotion.findById(id);
            const data = await Promotion.aggregate([
                {
                    $match: {
                        state: true,
                        _id: idobj
                    }
                },
                {
                    $unwind: {
                        path: "$applicableProducts",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        let: { applicableProducts: "$applicableProducts" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$applicableProducts"] },
                                            { $eq: ["$state", true] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "applicableProducts"
                    }
                },
                {
                    $addFields: {
                        applicableProducts: { $arrayElemAt: ["$applicableProducts", 0] }
                    }
                },
                {
                    $group: {
                        _id: "$_id", // Gộp theo `_id` của promotion
                        name: { $first: "$name" },
                        description: { $first: "$description" },
                        type: { $first: "$type" },
                        value: { $first: "$value" },
                        startDate: { $first: "$startDate" },
                        endDate: { $first: "$endDate" },
                        state: { $first: "$state" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        applicableProducts: { $push: "$applicableProducts" } // Gộp tất cả applicableProducts thành mảng
                    }
                }
            ])
            if (!data) {
                rj({
                    status: "ERR",
                    message: `Không tồn tại chương trình có ID ${id}`
                })
            } else {
                rs({
                    status: "OK",
                    message: "Lấy thông tin chương trình thành công",
                    data: data[0]
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}
const createPromotion = (dataPromotion) => {
    return new Promise((resolve, reject) => {
      Promotion.create(dataPromotion)
        .then((promotion) => {
          resolve({
            status: "OK",
            message: "Tạo chương trình khuyến mãi thành công",
            data: promotion,
          });
        })
        .catch((err) => {
          console.error("Error in creating promotion:", err);  // Log chi tiết lỗi
          reject(err);  // Nếu có lỗi, trả lại lỗi
        });
    });
  };
// const createPromotion = (dataPromotion) => {
//   return new Promise((rs, rj) => {
//     let applicableProducts = [];
//     if (typeof dataPromotion.applicableProducts === 'string') {
//       applicableProducts = dataPromotion.applicableProducts
//         .split(',')
//         .map((id) => new mongoose.Types.ObjectId(id.trim()));
//     } else if (Array.isArray(dataPromotion.applicableProducts)) {
//       applicableProducts = dataPromotion.applicableProducts.map((id) => new mongoose.Types.ObjectId(id));
//     }

//     Promotion.create({
//       name: dataPromotion.name,
//       desc: dataPromotion.desc,
//       type: dataPromotion.type,
//       value: dataPromotion.value,
//       startDate: dataPromotion.startDate,
//       endDate: dataPromotion.endDate,
//       applicableProducts: applicableProducts,
//       state: true,
//     })
//       .then((promotion) => {
//         rs({
//           status: "OK",
//           message: "Tạo chương trình khuyến mãi thành công",
//           data: promotion,
//         });
//       })
//       .catch((err) => {
//         rj(err);
//       });
//   });
// };


const updateStatus = async (id, state) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Tìm và cập nhật đơn hàng theo ID
        const updatedPromotion = await Promotion.findById(id);
  
        // Nếu không tìm thấy đơn hàng
        if (!updatedPromotion) {
          resolve({
            status: "ERR",
            message: "Đơn hàng không tồn tại!",
          });
        }
  
        updatedPromotion.state = state
        await updatedPromotion.save();
  
        resolve({
          status: "OK",
          message: "Đã hoàn thành đơn hàng!",
          data: updatedPromotion
        });
      } catch (error) {
        reject(error);
      }
    })
  };

export default {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updateStatus
}