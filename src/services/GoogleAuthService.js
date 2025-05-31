import User from '../models/UserModel.js';
import dotenv from "dotenv";
import JWTService from './JWTService.js';
dotenv.config();
const generateComboToken = async (data) => {
    const access_token = await JWTService.generateAccessToken(data);
    const refresh_token = await JWTService.generateRefreshToken(data);
    return { access_token, refresh_token }
}
const login = async (user) => {
    return new Promise(async (rs, rj) => {
        try {
            const { email } = user
            const finded_user = await User.findOne({ email });
            if (!finded_user) {
                const newUser = await User.create({
                    name: user.displayName,
                    googleId: user.id,
                    email: user.email,
                    avatar: {
                        preview: user.picture
                    }
                })
                const { access_token, refresh_token } = await generateComboToken({
                    id: newUser._id,
                    name: newUser.name,
                    googleId: newUser.googleId,
                    email: newUser.email
                })
                rs({
                    status: "OK",
                    message: "Đăng nhập thành công!",
                    data: {
                        access_token,
                        refresh_token,
                        user: newUser
                    },
                });
            } else {
                if (!finded_user.googleId) {
                    rj({
                        status: "ERROR",
                        message: "This email is used for another method"
                    })
                    return;
                }
                const { access_token, refresh_token } = await generateComboToken({
                    id: finded_user._id,
                    name: finded_user.name,
                    googleId: finded_user.googleId,
                    email: finded_user.email
                })
                rs({
                    status: "OK",
                    message: "Đăng nhập thành công!",
                    data: {
                        
                        access_token,
                        refresh_token,
                        user: finded_user
                    },
                });
            }
        } catch (err) {
            rj(err);
        }
    })
}



export default {
    login
}