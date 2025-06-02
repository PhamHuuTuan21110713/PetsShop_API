import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Đảm bảo đúng tên biến

async function findRelatedName(inputWord) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            apiVersion: "v1beta",
        });

        const prompt = `
Người dùng có thể nhập sai chính tả từ hoặc cụm từ sau:
"${inputWord}"
Hãy đưa ra từ hoặc cụm từ đúng chính tả nhất và không thêm giải thích. Chỉ trả về duy nhất từ hoặc cụm từ đã được sửa chính tả.
`;

        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        const response = result.response;
        const text = response.text().trim();

        return text;
    } catch (err) {
        console.error("Lỗi khi gọi Gemini API:", err);
        throw err;
    }
}

export default {
    findRelatedName,
};
