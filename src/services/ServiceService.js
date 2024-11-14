import Service from "~/models/ServiceModel";
import mongoose from "mongoose";
const getServiceById = (id) => {
    const idobj = new mongoose.Types.ObjectId(id);
    return new Promise(async (rs, rj) => {
        try {
            // const service = await Service.findById(id);
            const service = await Service.aggregate([
                {
                    $match: {
                        _id: idobj,
                        state: true
                    }
                },
                {
                    $unwind: {
                        path: "$applicableBranches",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "shopinformations",
                        // localField: "$applicableBranches",
                        let: { branchId: "$applicableBranches" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$$branchId", "$branches._id"] },
                                            { $eq: ["$state", true] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    branches: {//Giu lai cot branches
                                        $filter: { // Lọc phần tử trong branches dựa trên id
                                            input: "$branches",
                                            as: "branch",//Ten cua trường đại diện cho mỗi phần tử trong branch
                                            cond: { $eq: ["$$branch._id", "$$branchId"] } // Điều kiện lọc
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    branches: { $arrayElemAt: ["$branches", 0] }  // Lấy phần tử đầu tiên trong mảng branches
                                }
                            },
                            {
                                $replaceRoot: { newRoot: "$branches" }  // Thay thế đối tượng với key "branches" thành đối tượng bên trong
                            }
                        ],
                        as: "applicableBranches"
                    }
                },
                {
                    $group: {
                        _id: "$_id", // Nhóm theo _id của Service
                        name: { $first: "$name" }, // Lấy giá trị đầu tiên của name
                        description: { $first: "$description" }, // Lấy giá trị đầu tiên của description
                        price: { $first: "$price" }, // Giữ lại giá trị đầu tiên của price
                        procedures: { $first: "$procedures" }, // Giữ lại giá trị đầu tiên của procedures
                        applicableBranches: { $push: { $arrayElemAt: ["$applicableBranches", 0] } }, // Tạo lại mảng applicableBranches
                        state: { $first: "$state" }, // Giữ lại trạng thái
                        createdAt: { $first: "$createdAt" }, // Giữ lại createdAt
                        updatedAt: { $first: "$updatedAt" } // Giữ lại updatedAt
                    }
                },

            ])
            if (service) {
                rs({
                    status: "OK",
                    message: "Lay thong tin dich vu thanh cong",
                    data: service[0]
                })
            } else {
                rj({
                    status: "ERR",
                    message: `Khong ton tai dich vu voi ID: ${id}`
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

const createService = (data) => {
    return new Promise(async (rs, rj) => {
        try {
            const service = await Service.create(data);
            if (service) {
                rs({
                    status: "OK",
                    message: "Tao dich vu thanh cong",
                    data: service
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

const getAllServices = () => {
    return new Promise(async (rs, rj) => {
        try {
            const data = await Service.find();
            if (data) {
                rs({
                    status: "OK",
                    message: "Lay danh sach dich vu thanh cong",
                    data
                })
            }
        } catch (err) {
            rj(err);
        }
    })
}

export default {
    getAllServices,
    createService,
    getServiceById
}