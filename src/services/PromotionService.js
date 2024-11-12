import Promotion from "~/models/Promotion";

const getAllPromotions = () => {
    return new Promise(async (rs, rj) => {
        try {
            const promotions = await Promotion.find();
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
    return new Promise(async (rs, rj) => {
        try {
            const data = await Promotion.findById(id);
            if (!data) {
                rj({
                    status: "ERR",
                    message: `Không tồn tại chương trình có ID ${id}`
                })
            } else {
                rs({
                    status: "OK",
                    message: "Lấy thông tin chương trình thành công",
                    data: data
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