import Product from "../models/ProductModel.js";
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import Preference from "../models/PreferenceModel.js";
import updateData from "../utils/updateDataTraining.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = path.resolve(__dirname, '../services/Recommend.py');
const get = (id, page = 1, limit = 10) => {
    return new Promise(async (rs, rj) => {
        try {
            const userId = id;
            const k = limit;
            // console.log('Đường dẫn script:', scriptPath);   
            execFile('py', [scriptPath, userId, k.toString(), page.toString()], async (error, stdout, stderr) => {
                if (error) {
                    console.error('Lỗi khi chạy Python:', error);
                    return;
                }

                if (stderr) {
                    console.error('stderr:', stderr);
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    console.log("result: ", result)
                    if (result.total <= 0) {
                        rs({
                            status: "OK",
                            message: "Get successfully!",
                            data: [],
                            page: 1,
                            total_pages: 0,
                            total: 0
                        })
                    } else {
                        const list_id = result.data;
                        const products = await Product.find({
                            _id: { $in: list_id }
                        });
                        rs({
                            status: "OK",
                            message: "Get successfully!",
                            data: products,
                            page: result.page,
                            total_pages: result.total_pages,
                            total: result.total
                        })
                    }
                    // console.log('Gợi ý sản phẩm:', result);
                } catch (err) {
                    console.error('Không thể parse JSON:', err);
                }
            });
        } catch (err) {
            rj(err);
        }
    })
}

const update = (userId, productId, information) => {
    // console.log("update data:", userId, " ", productId, " ", information)
    return new Promise(async (rs, rj) => {
        try {
            const prefrence = await Preference.findOne({ userId });
            console.log("fined: ", prefrence)
            if (!prefrence) {
                if (information === "prefer") {
                    await Preference.create({
                        userId,
                        prefres: [{
                            productId: productId,
                            accessDate: Date.now()
                        }],
                        views: []
                    })
                    updateData()
                    rs({
                        status: "OK",
                        message: "Update successfully"
                    })

                } else if (information === "view") {
                    await Preference.create({
                        userId,
                        prefres: [],
                        views: [{
                            productId: productId,
                            accessDate: Date.now(),
                            numberAccess: 1
                        }]
                    })
                    rs({
                        status: "OK",
                        message: "Update successfully"
                    })
                    updateData()
                } else {
                    rj({
                        status: "ERR",
                        message: "Type update is not valid!"
                    })
                }
            } else {
                if (information === "prefer") {
                    const isExist = prefrence.prefres.some(p => p.productId === productId);
                    if (isExist) {
                        await Preference.updateOne(
                            { _id: prefrence._id },
                            {
                                $pull: {
                                    prefres: { productId: productId }
                                }
                            }
                        );
                    } else {
                        if (prefrence.prefres.length < 10) {

                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $push: {
                                        prefres: {
                                            productId,
                                            accessDate: new Date()
                                        }
                                    }
                                }
                            );
                        } else {
                            const oldest = prefrence.prefres.reduce((min, item) =>
                                new Date(item.accessDate) < new Date(min.accessDate) ? item : min
                            );

                            // 2. Xóa phần tử đó
                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $pull: {
                                        prefres: { productId: oldest.productId }
                                    }
                                }
                            );

                            // 3. Thêm phần tử mới vào
                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $push: {
                                        prefres: {
                                            productId,
                                            accessDate: new Date()
                                        }
                                    }
                                }
                            );
                        }
                    }
                    updateData()
                    rs(
                        {
                            status: "OK",
                            message: "Update successfully"
                        }
                    )
                } else {
                    const isExist = prefrence.views.some(v => v.productId === productId);
                    if (isExist) {
                        // Nếu đã tồn tại: cập nhật accessDate và tăng numberAccess
                        await Preference.updateOne(
                            {
                                _id: prefrence._id,
                                "views.productId": productId
                            },
                            {
                                $set: {
                                    "views.$[elem].accessDate": new Date()
                                },
                                $inc: {
                                    "views.$[elem].numberAccess": 1
                                }
                            },
                            {
                                arrayFilters: [{ "elem.productId": productId }]
                            }
                        );
                    } else {
                        if (prefrence.views.length < 10) {
                            // Nếu chưa đủ 10 phần tử: thêm mới
                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $push: {
                                        views: {
                                            productId,
                                            numberAccess: 1,
                                            accessDate: new Date()
                                        }
                                    }
                                }
                            );
                        } else {
                            // Nếu đã đủ 10 phần tử: xóa phần tử cũ nhất rồi thêm mới
                            const oldest = prefrence.views.reduce((min, item) =>
                                new Date(item.accessDate) < new Date(min.accessDate) ? item : min
                            );

                            // Xóa phần tử có accessDate cũ nhất
                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $pull: {
                                        views: { productId: oldest.productId }
                                    }
                                }
                            );

                            // Thêm mới
                            await Preference.updateOne(
                                { _id: prefrence._id },
                                {
                                    $push: {
                                        views: {
                                            productId,
                                            numberAccess: 1,
                                            accessDate: new Date()
                                        }
                                    }
                                }
                            );
                        }
                    }
                    updateData()
                    rs(
                        {
                            status: "OK",
                            message: "Update successfully"
                        }
                    )
                }
            }
        } catch (err) {
            rj(err);
        }
    })
}

const checkLiked = (userId, productId) => {
    return new Promise(async (rs, rj) => {
        try {
            const prefer = await Preference.findOne({userId});
            if(!prefer) {
                rs({
                    status: "OK",
                    data: false
                })
            } else {
                const isExist = prefer.prefres.some(p => p.productId === productId);
                rs({
                    status: "OK",
                    data: isExist
                })
            }
        }catch(err) {
            rj(err);
        }
    })
}

export {
    get,
    update,
    checkLiked
}