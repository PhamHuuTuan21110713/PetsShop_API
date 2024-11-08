import Category from "~/models/CategoryModel"
import { slugify } from "~/utils/formatters";

const getAllCategories = () => {
    return new Promise(async (rs, rj) => {
        try {
            const categories = await Category.aggregate([
                // Bước 1: Tìm các category cha (parentCategoryId = "none")
                {
                    $match: {
                        parentCategoryId: 'none'
                    }
                },
                {
                    $addFields: {
                        idAsString: { $toString: "$_id" }
                    }
                },
                // Bước 2: Kết hợp (lookup) các category con dựa trên parentCategoryId
                {
                    $lookup: {
                        from: 'categories', // Tên của collection (nếu sử dụng mongoose thì sẽ là tên nhỏ của model)
                        localField: 'idAsString', // Trường _id của danh mục cha
                        foreignField: 'parentCategoryId', // Trường parentCategoryId của danh mục con
                        as: 'subCategory' // Trường mới chứa danh sách category con
                    }
                },
                // Bước 3: Tùy chọn - Loại bỏ trường parentCategoryId trong kết quả
                {
                    $project: {
                        parentCategoryId: 0,
                        idAsString: 0
                    }
                }
            ])
            if (!categories) rj({
                status: "ERROR",
                message: "Lấy dữ liệu thất bại",
            })
            rs({
                status: "OK",
                message: "Lấy dữ liệu thành công",
                data: categories
            })
        } catch (err) {
            rj(err)
        }

    })
}

const getCategoryById = (id) => {
    return new Promise(async (rs, rj) => {
        try {
            const cate = await Category.findById(id);
            if (!cate) {
                rj({
                    status: "ERR",
                    message: "Không tồn tại danh mục vừa chọn"
                })
            }
            rs({
                status: "OK",
                message: "Lấy danh mục thành côn",
                data: cate
            })
        } catch (err) {
            rj(err);
        }
    })
}

const createNewCategory = (data) => {

    return new Promise(async (rs, rj) => {
        try {
            const category = await Category.create({
                name: data.name,
                description: data.description,
                parentCategoryId: data?.parentCategoryId,
                tag: slugify(data.name)
            })
            if (category) {
                rs({
                    status: "OK",
                    message: "Tạo danh mục thành công",
                    data: category
                })
            }
        } catch (err) {
            rj(err)
        }
    })
}

export default {
    getAllCategories,
    createNewCategory,
    getCategoryById
}