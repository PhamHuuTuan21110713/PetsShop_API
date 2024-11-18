import Promotion from "~/models/Promotion";
import mongoose from "mongoose";
const getAllPromotions = (outdated = "none", condition = {}) => {

    return new Promise(async (rs, rj) => {
        try {
            let promotions = null;
            const today = new Date();
            if (outdated === "true") {
                promotions = await Promotion.find({
                    $or: [
                        { startDate: { $gt: today } }, 
                        { endDate: { $lt: today } } 
                    ], 
                    ...condition, 
                    state: true
                });
            } else if (outdated === "false") {
                promotions = await Promotion.find({
                    startDate: { $lte: today },
                    endDate: { $gte: today },
                    ...condition,
                    state: true
                });
            } else {
                console.log("chay vao day")
                promotions = await Promotion.find({ ...condition, state: true });
            }
            if (promotions) {
                rs({
                    status: "OK",
                    message: "Lấy danh sách chương trình khuyến mãi thành công",
                    data: promotions
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

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
    return new Promise(async (rs, rj) => {
        try {
            const promotion = await Promotion.create({
                name: dataPromotion.name,
                description: dataPromotion.description,
                type: dataPromotion.type,
                value: dataPromotion.value,
                startDate: dataPromotion.startDate,
                endDate: dataPromotion.endDate,
                applicableProducts: dataPromotion.applicableProducts,
                state: true
            })
            if (promotion) {
                rs({
                    status: "OK",
                    message: "Tạo chương trình khuyến mãi thành công",
                    data: promotion
                })
            }
        } catch (err) {
            rj(err)
        }
    })
}

export default {
    createPromotion,
    getAllPromotions,
    getPromotionById
}