import EmailService from "~/services/EmailService";
import User from "~/models/UserModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const sendPIN = async (req, res) => {
    try {
        const { receiveEmail } = req.body;
        const response = await EmailService.sendPIN(receiveEmail);
        return res.status(201).json(response);
    } catch (err) {
        res.status(404).json(err);
    }
}
const checkPIN = async (req, res) => {
    try {
        const { receiveEmail, pin } = req.body;
        const response = await EmailService.checkPIN(receiveEmail, pin);
        if(response) {
            res.status(200).json(response)
        }
    } catch (err) {
        res.status(404).json(err);
    }
}
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Xác minh token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const email = decoded.email;
        const id = decoded.id;
        const parseId = new mongoose.Types.ObjectId(id);
        // Cập nhật trạng thái tài khoản thành "active"
        await User.updateOne({_id:parseId, email }, { $set: { state: 1 } });

        res.send(`
            <p>Tài khoản của bạn đã được kích hoạt thành công!</p>
        `);
    } catch (err) {
        console.log("Error email verify: ", err);
        res.status(400).send('Token không hợp lệ hoặc đã hết hạn.');
    }
}
export default {
    sendPIN,
    checkPIN,
    verifyEmail
}