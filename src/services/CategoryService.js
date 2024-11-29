import Category from "~/models/CategoryModel"
import { slugify } from "~/utils/formatters";
import mongoose from "mongoose";
import Product from "~/models/ProductModel";
import Promotion from "~/models/Promotion";
const getAllCategories = () => {
    return new Promise(async (rs, rj) => {
        try {
            const categories = await Category.aggregate([
                //Tìm các category cha (parentCategoryId = "none")
                {
                    $match: {
                        parentCategoryId: 'none',
                        state: 1 //new
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
                // Lọc subCategory để chỉ lấy những danh mục con có state = 1
                {
                    $addFields: {
                        subCategory: {
                            $filter: {
                                input: "$subCategory", // Mảng cần lọc
                                as: "sub", // Tên biến đại diện cho từng phần tử
                                cond: { $eq: ["$$sub.state", 1] } // Điều kiện lọc (state = 1)
                            }
                        }
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

// Cho kiểm thử
// const generateParentCategoryAPI = async (parCategory) => {

//     try {
//         const copy =  parCategory.toObject();
//         console.log("coppy type: ", typeof copy)
//         const products = [];
//         const subCategories = await Category.find({ parentCategoryId: parCategory._id });
//         if (subCategories.length > 0) {
//             for (let sub of subCategories) {
//                 const id = sub._id.toString();;
//                 const prods = await Product.find({ categoryId: id });

//                 for (let prod of prods) {
//                     const prodId = new mongoose.Types.ObjectId(prod._id);
//                     const promotions = await Promotion.find({ applicableProducts: { $in: [prodId] } });
//                     prod.promotion = promotions[0];
//                     products.push(prod);

//                 }

//             }
//         }
//         copy.products = products
//         return copy;
//     } catch (err) {
//         console.log("err", err)
//         return err;
//     }

// }

const getCategoryById = (id, condition, paging, sort = { sold: -1 }) => {
    const minStar = parseInt(condition.minStar);
    const maxStar = parseInt(condition.maxStar);
    const minPrice = parseInt(condition.minPrice);
    const maxPrice = parseInt(condition.maxPrice);
    const isOnlyPromotion = condition.onlyPromotion;
    const page = parseInt(paging.page);
    const limit = parseInt(paging.limit);
    const skip = (page - 1) * limit;
    const idobj = new mongoose.Types.ObjectId(id);
    const matchStage = isOnlyPromotion === true
        ? { "products.promotions.0": { $exists: true } }  // Lọc sản phẩm có khuyến mãi
        : {};
    console.log("match: ", matchStage);
    return new Promise(async (rs, rj) => {
        try {
            const cate = await Category.findById(id);
            if (cate) {
                let result = null;
                if (cate.parentCategoryId === "none") {
                    // tối ưu truy vấn có khuyến mãi
                    result = await Category.aggregate([
                        {
                            $match: {
                                _id: idobj,
                                state: 1
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
                        // Lọc subCategory để chỉ lấy những danh mục con có state = 1
                        {
                            $addFields: {
                                subCategory: {
                                    $filter: {
                                        input: "$subCategory", // Mảng cần lọc
                                        as: "sub", // Tên biến đại diện cho từng phần tử
                                        cond: { $eq: ["$$sub.state", 1] } // Điều kiện lọc (state = 1)
                                    }
                                }
                            }
                        },
                        {
                            $unwind: {
                                path: "$subCategory",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $addFields: {
                                stringSubCategoryId: { $toString: "$subCategory._id" },
                            }
                        },
                        {
                            $lookup: {
                                from: 'products',
                                // localField: "stringSubCategoryId",
                                // foreignField: "categoryId",
                                let: { subCatId: "$stringSubCategoryId" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$categoryId", "$$subCatId"] },
                                                    { $eq: ["$state", true] },
                                                    { $gte: ["$price", minPrice] },
                                                    { $lte: ["$price", maxPrice] },
                                                    { $gte: ["$rating", minStar] },
                                                    { $lte: ["$rating", maxStar] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "products"
                            }
                        },
                        {
                            $unwind: {
                                path: "$products",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'promotions',
                                // localField: 'products._id',
                                // foreignField: "applicableProducts",
                                let: { productId: "$products._id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$state", true] } ,
                                                    { $in: ["$$productId", "$applicableProducts"] }, // Kiểm tra xem productId có trong applicableProducts
                                                    { $lte: ["$startDate", new Date()] }, // startDate <= ngày hiện tại
                                                    { $gte: ["$endDate", new Date()] } // endDate >= ngày hiện tại
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "products.promotions"
                            }
                        },

                        {
                            $group: {
                                _id: "$_id",  // Nhóm theo _id của Category
                                allFields: { $first: "$$ROOT" },  // Lấy tất cả các trường còn lại từ category
                                products: { $push: "$products" }  // Nối tất cả các phần tử products vào mảng
                            }
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        "$allFields",  // Thêm tất cả các trường từ allFields
                                        { products: { $concatArrays: ["$products", "$products.products"] } }  // Kết hợp các mảng products
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                products: { $filter: { input: "$products", cond: isOnlyPromotion ? { $gt: [{ $size: "$$this.promotions" }, 0] } : true } }
                            }
                        },
                        {
                            $addFields: {
                                // Sắp xếp mảng products theo trường sold giảm dần
                                products: { $sortArray: { input: "$products", sortBy: sort } }
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
                                subCategory: 0,  // Loại bỏ trường subCategory
                                stringSubCategoryId: 0,  // Loại bỏ trường stringSubCategoryId
                            }
                        }
                    ]);
                } else {
                    result = await Category.aggregate([
                        {
                            $match: {
                                _id: idobj,
                                state: 1
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
                                                    { $eq: ["$state", true] },
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
                        // Adding 
                        {
                            $unwind: {
                                path: "$products",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'promotions',
                                // localField: 'products._id',
                                // foreignField: "applicableProducts",
                                let: { productId: "$products._id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $in: ["$$productId", "$applicableProducts"] }, // Kiểm tra xem productId có trong applicableProducts
                                                    { $lte: ["$startDate", new Date()] }, // startDate <= ngày hiện tại
                                                    { $gte: ["$endDate", new Date()] } // endDate >= ngày hiện tại
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "products.promotions"
                            }
                        },
                        // {
                        //     $match: matchStage
                        // },
                        {
                            $group: {
                                _id: "$_id",  // Nhóm theo _id của Category
                                allFields: { $first: "$$ROOT" },  // Lấy tất cả các trường còn lại từ category
                                products: { $push: "$products" }  // Nối tất cả các phần tử products vào mảng
                            }
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        "$allFields",  // Thêm tất cả các trường từ allFields
                                        { products: { $concatArrays: ["$products", "$products.products"] } }  // Kết hợp các mảng products
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                products: { $filter: { input: "$products", cond: isOnlyPromotion ? { $gt: [{ $size: "$$this.promotions" }, 0] } : true } }
                            }
                        },
                        {
                            $addFields: {
                                // Sắp xếp mảng products theo trường sold giảm dần
                                products: { $sortArray: { input: "$products", sortBy: sort } }
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
                                idAsString: 0
                            }
                        }
                    ])
                }
                // const res = await generateParentCategoryAPI(cate)
                rs({
                    stauts: "OK",
                    message: "Lấy danh mục thành công",
                    data: result[0]
                    // data: res
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