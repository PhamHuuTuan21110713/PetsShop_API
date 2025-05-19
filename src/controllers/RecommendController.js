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

export {
    get
}