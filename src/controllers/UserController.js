// const UserService = require("../services/UserService");
// const JWTService = require("../services/JWTService");
// const cloudinary = require("cloudinary").v2;
// const useragent = require("useragent");
import * as UserService from "~/services/UserService";
import JWTService from "~/services/JWTService";
import { v2 as cloudinary } from "cloudinary";
import useragent from "useragent";

const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, address, phone } =
      req.body;
    const checkEmail = String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !phone
    ) {
      res.status(200).json({
        status: "ERR",
        message: "Các trường không được để trống!",
      });
    } else if (!checkEmail) {
      res.status(200).json({
        status: "ERR",
        message: "Email không đúng định dạng!",
      });
    } else if (password !== confirmPassword) {
      res.status(200).json({
        status: "ERR",
        message: "Mật khẩu nhập lại không khớp!",
      });
    } else {
      // const imageFile = req.file;
      const response = await UserService.createUser(req.body);
      return res.status(200).json(response);
    }
  } catch (error) {
    // const imageFile = req.file;
    // if (imageFile) cloudinary.uploader.destroy(imageFile.filename);
    // console.log("err here")
    // console.log(error);
    return res.status(404).json({

      message: error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const response = await UserService.loginUser(req.body);
    const refresh_token = response.data.refresh_token;
    // console.log("access_token: ", response.data.access_token)
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,      // Chỉ cho phép truy cập qua HTTP, không thể truy cập từ JavaScript
      // secure: true,        // Chỉ gửi qua kết nối HTTPS
      sameSite: 'Strict',  // Giúp ngăn CSRF 
      maxAge: 24 * 60 * 60 * 1000  // Thời gian tồn tại của cookie, ví dụ: 1 ngày
      // maxAge: 10  // Thời gian tồn tại của cookie, ví dụ: 1 ngày

    })
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    // const token = req.headers.refresh_token?.split(" ")[1];
    const token = req.cookies.refresh_token;
    // console.log("refresh token: ",token)
    if (!token) {
      return res.status(403).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await JWTService.refreshTokenService(token);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await UserService.getUserById(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const imageFile = req.file;
    const data = req.body;
    const response = await UserService.updateUser(userId, data, imageFile);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    const { productId, name, img, size, quantity, price } = data;
    if (!productId || !name || !img || !size || !quantity || !price) {
      return res.status(200).json({
        status: "ERR",
        message: "Không có dữ liệu sản phẩm!",
      });
    }

    const response = await UserService.addToCart(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const { productId, size } = req.body;
    const response = await UserService.removeFromCart(userId, productId, size);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const payment = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    const response = await UserService.payment(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await UserService.clearCart(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const agent = useragent.parse(req.headers["user-agent"]);
    const operating_system = agent.os.toString();
    const response = await UserService.forgotPassword(email, operating_system);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { key, token, password, confirmPassword } = req.body;
    const response = await UserService.resetPassword({
      key,
      token,
      password,
      confirmPassword,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const response = await UserService.sendMessage(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: true,  // Chỉ dùng nếu bạn đang chạy trên HTTPS
  });
  return res.status(200).json({
    status: "SUCCESS",
    message: "Refresh token đã được xóa",
  });
};

export {
  createUser,
  loginUser,
  refreshToken,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  addToCart,
  removeFromCart,
  payment,
  clearCart,
  forgotPassword,
  resetPassword,
  sendMessage,
  logout
};
