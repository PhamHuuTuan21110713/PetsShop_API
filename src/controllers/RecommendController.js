import * as RecommendService from "../services/RecommendService.js"
const get = async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log("get params: ", page, " | ", limit)
    try {
        const response = await RecommendService.get(id, page, limit);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const update = async (req, res) => {
    const userId = req.params.id;
    const { productId, information } = req.body
    if (!productId) res.status(400).json({ status: "ERR", message: "ProductId is required!" })
    try {
        const response = await RecommendService.update(userId, productId, information);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const checkLiked = async (req, res) => {
    const userId = req.params.id;
    const { productId } = req.body
    try {
        const response = await RecommendService.checkLiked(userId, productId);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(404).json(err);
    }
}

export {
    get,
    update,
    checkLiked
}