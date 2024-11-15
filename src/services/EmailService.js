import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import redis from "./Redis.js";
const sendPIN = async (email) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.PASSWORD_EMAIL_SENDER,
        },
    });
    const key = `pin${email}`;
    const value = `${pin}`;
    try {
        await redis.set(key, value, 120);
        const info = await transporter.sendMail({
            from: '"BetShob" <Betshob@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Mã PIN để cập nhật email mới của bạn", // Subject line
            text: "Mã PIN được gửi từ BetShob", // plain text body
            html: `<div><p>Mã pin của bạn:</p><br /> <p>${pin}</p></div>`, // html body
        });
        console.log("sendedEmail")
        return info;
    }catch(err) {
        return err
    }
    
  
}

const checkPIN = (email, pin) => {
    return new Promise(async (rs, rj) => {
        try {
            const pinRedis = await redis.get(`pin${email}`);
            if (!pinRedis) {
                rj({
                    status: "ERR",
                    message: "Mã PIN không hợp lệ hoặc đã hết hạn.",

                })
            }
            if (pinRedis === pin) {
                console.log("Mã PIN hợp lệ.");
                rs({
                    status: "OK",
                    message: "Mã PIN hợp lệ"
                })
            } else {
                rj({
                    status: "ERR",
                    message: "Mã PIN không hợp lệ.",

                })
            }
        } catch (err) {
            rj(err);
        }
    })

}

export default {
    sendPIN,
    checkPIN
}