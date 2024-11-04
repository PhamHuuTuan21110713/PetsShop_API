import Category from '../models/CategoryModel.js';

const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const category = await Category.create({ name, parent });
    res.status(201).json({ status: "OK", data: category });
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error});
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ status: "OK", data: categories });
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

export {
    createCategory,
    getCategories
}
