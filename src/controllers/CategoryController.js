import CategoryService from "~/services/CategoryService";

const getAllCategories = async (req, res) => {
    try {
        const resonse = await CategoryService.getAllCategories();
        return res.status(200).json(resonse);
    } catch (err) {
        return res.status(404).json(err);
    }
}

const createNewCategory = async (req, res) => {
    try {
        const data = req.body;
        const response = await CategoryService.createNewCategory(data);
        return res.status(201).json(response);
    } catch (err) {
        return res.stauts(404)
    }
}

const getCategoryById = async (req, res) => {
    const id = req.params.id;
    // console.log("id: ", typeof id)
    const { page = 1, limit = 3, ...filters } = req.query;
    // console.log("page: ", page);
    // console.log("limit: ", limit)
    // console.log("filter: ", filters);
    const { minStar = 0, maxStar = 5, minPrice = 0, maxPrice =Number.MAX_SAFE_INTEGER, isPromotion = false, isVoucher = false } = filters;
    try {
        const response = await CategoryService.getCategoryById(id, { minStar, maxStar, minPrice, maxPrice }, { page, limit })
        // console.log("page: ",page)
        // console.log("limit: ",limit)
        // console.log("filters: ",filters)
        return res.status(200).json(response);

    } catch (err) {
        res.status(404).json(err);
    }
}

export default {
    getAllCategories,
    createNewCategory,
    getCategoryById
}