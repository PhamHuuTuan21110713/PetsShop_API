
import GoogleAuthService from "../services/GoogleAuthService.js";
import dotenv from 'dotenv';
dotenv.config();

const loginOauth = async (req, res) => {
    try {
        const response = await GoogleAuthService.login(req.user);
        const refresh_token = response.data.refresh_token;
        const access_token = response.data.access_token
        // console.log("access_token: ", response.data.access_token)
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,      // Chỉ cho phép truy cập qua HTTP, không thể truy cập từ JavaScript
            // secure: true,        // Chỉ gửi qua kết nối HTTPS
            sameSite: 'Strict',  // Giúp ngăn CSRF 
            maxAge: 24 * 60 * 60 * 1000  // Thời gian tồn tại của cookie,
            // maxAge: 10000  // 

        })
        // return res.status(200).json(response);
        return res.redirect(`${process.env.CLIENT_URL}?token=${access_token}`);
    } catch (err) {
        return res.status(500).json(err);
    }
}


export default {
    loginOauth
}