import CategoryService from "~/services/CategoryService";

const getAllCategories = async (req, res) => {
    try {
        const resonse = await CategoryService.getAllCategories();
        return res.status(200).json(resonse);
    } catch(err) {
        return res.status(404).json(err);
    }
}

const createNewCategory = async (req, res) => {
    try {
        const data = req.body;
        const response = await CategoryService.createNewCategory(data);
        return res.status(201).json(response);
    } catch(err) {
        return res.stauts(404)
    }
}

export default {
    getAllCategories,
    createNewCategory
}