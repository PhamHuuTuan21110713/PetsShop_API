import Product from "../models/ProductModel.js";
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

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

export {
    get
}