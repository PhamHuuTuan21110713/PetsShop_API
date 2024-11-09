import Category from "~/models/CategoryModel"
import { slugify } from "~/utils/formatters";
import Product from "~/models/ProductModel";
import mongoose from "mongoose";
const getAllCategories = () => {
    return new Promise(async (rs, rj) => {
        try {
            const categories = await Category.aggregate([
                //Tìm các category cha (parentCategoryId = "none")
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
                //Kết hợp (lookup) các category con dựa trên parentCategoryId
                {
                    $lookup: {
                        from: 'categories', // Tên của collection (nếu sử dụng mongoose thì sẽ là tên nhỏ của model)
                        localField: 'idAsString', // Trường _id của danh mục cha
                        foreignField: 'parentCategoryId', // Trường parentCategoryId của danh mục con
                        as: 'subCategory' // Trường mới chứa danh sách category con
                    }
                },
                // - Loại bỏ trường parentCategoryId trong kết quả
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

const getCategoryById = (id, condition, paging) => {
    const minStar = parseInt(condition.minStar);
    const maxStar = parseInt(condition.maxStar);
    const minPrice = parseInt(condition.minPrice);
    const maxPrice = parseInt(condition.maxPrice);
    const page = parseInt(paging.page);
    const limit = parseInt(paging.limit)
    const skip = (page - 1) * limit;
    const idobj = new mongoose.Types.ObjectId(id);
    // console.log("id: ", id)
    return new Promise(async (rs, rj) => {
        try {
            const cate = await Category.findById(id);
            if (cate) {
                let result = null;
                if (cate.parentCategoryId === "none") {
                    result = await Category.aggregate([
                        {
                            $match: {
                                _id: idobj
                            }
                        },
                        {
                            $addFields: {
                                idAsString: { $toString: "$_id" }
                            }
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'idAsString',
                                foreignField: 'parentCategoryId',
                                as: 'subCategory'
                            }
                        },
                        {
                            $addFields: {

                                products: {
                                    $cond: {
                                        if: { $or: [{ $eq: ["$subCategory", null] }, { $eq: ["$subCategory", undefined] }] },
                                        then: [],
                                        else: "$subCategory"
                                    }
                                }
                            }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $addFields: {
                                stringSubCategoryId: { $toString: "$products._id" },// Tạo trường mới addString chứa giá trị của _id dưới dạng string
                            }
                        },
                        {
                            $lookup: {
                                from: 'products',
                                let: { subCatId: "$stringSubCategoryId" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$categoryId", "$$subCatId"] },
                                                    { $gte: ["$price", minPrice] },
                                                    { $lte: ["$price", maxPrice] },
                                                    { $gte: ["$rating", minStar] },
                                                    { $lte: ["$rating", maxStar] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: 'products.products'
                            }
                        },
                        {
                            $group: {
                                _id: '$_id',
                                allFields: { $first: '$$ROOT' },
                                products: { $push: '$products.products' },

                            }
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        "$allFields",
                                        { products: { $reduce: { input: "$products", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } } }
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                total: { $size: "$products" }  // Tính tổng số lượng sản phẩm trong mảng products
                            }
                        },
                        {
                            $addFields: {
                                products: { $slice: ["$products", skip, limit] },
                                page: { $literal: page },  // Trả về page
                                limit: { $literal: limit }  // Trả về limit
                            }
                        },
                        {
                            $project: {
                                stringSubCategoryId: 0,
                                subCategory: 0,
                                idAsString: 0
                            }
                        }
                    ]);
                } else {
                    result = await Category.aggregate([
                        {
                            $match: {
                                _id: idobj
                            }
                        },
                        {
                            $addFields: {
                                idAsString: { $toString: "$_id" }
                            }
                        },
                        {
                            $lookup: {
                                from: 'products', // Nếu parentCategoryId khác "none", join trực tiếp với bảng products
                                localField: 'idAsString',
                                foreignField: 'categoryId',
                                as: 'products',
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $gte: ["$price", minPrice] },
                                                    { $lte: ["$price", maxPrice] },
                                                    { $gte: ["$rating", minStar] },
                                                    { $lte: ["$rating", maxStar] }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                total: { $size: "$products" }  // Tính tổng số lượng sản phẩm trong mảng products
                            }
                        },
                        {
                            $addFields: {
                                products: { $slice: ["$products", skip, limit] }
                            }
                        },
                        {
                            $project: {
                                idAsString: 0
                            }
                        }
                    ])
                }
                rs({
                    stauts: "OK",
                    message: "Lấy danh mục thành công",
                    data: result[0]
                })
            }

        } catch (err) {
            rj(err)
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