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
        
        return res.stauts(404).json(err)
    }
}

const getCategoryById = async (req, res) => {
    const id = req.params.id;
    // console.log("id: ", typeof id)
    const { page = 1, limit = 3, sort, ...filters } = req.query;
    console.log("page: ", page);
    console.log("limit: ", limit)
    console.log("filter: ", filters);
    console.log("sort: ", sort)
    const { minStar = 0, maxStar = 5, minPrice = 0, maxPrice =Number.MAX_SAFE_INTEGER, onlyPromotion = false} = filters;
    let sorting = {sold: -1}
    if(sort === "sold") {
        sorting = {sold: -1}
    } else if (sort === "date") {
        sorting = {updatedAt: -1}
    } else if (sort === "price-up") {
        sorting = {price: 1}
    } else if (sort === "price-down") {
        sorting = {price: -1}
    }
    console.log("promotion: ", onlyPromotion)
    try {
        const response = await CategoryService.getCategoryById(id, { minStar, maxStar, minPrice, maxPrice,onlyPromotion: JSON.parse(onlyPromotion) }, { page, limit }, sorting)
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