import PromotionService from "~/services/PromotionService";

const getAllPromotions = async (req, res) => {
    try {
        const query = req.query;
       
        const {outdated = "none", ...others } = query;
        console.log("Promotion query: ", outdated);
        console.log("Promotion other: ", others);

        const response = await PromotionService.getAllPromotions(outdated, others);
        if(response) return res.status(200).json(response)
    }catch(err) {
        return res.status(404).json(err)
    }
}

const createPromotion = async (req, res) => {
    const data = req.body;
    // console.log("data request promotion: ", data);
    try {
        if(data) {
            const response = await PromotionService.createPromotion(data);
            return res.status(201).json(response);
        }
    }catch(err) {
        console.log("Promotion create err: ", err)
       return res.status(404).json(err)
    }
}

const getPromotionById = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await PromotionService.getPromotionById(id);
        if(response) return res.status(200).json(response);
    }catch(err) {
        return res.status(404).json(err);
    }
}

export default {
    createPromotion,
    getAllPromotions,
    getPromotionById
}