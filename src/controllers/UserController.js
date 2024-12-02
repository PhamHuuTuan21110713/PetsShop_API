// const UserService = require("../services/UserService");
// const JWTService = require("../services/JWTService");
// const cloudinary = require("cloudinary").v2;
// const useragent = require("useragent");
import * as UserService from "~/services/UserService";
import JWTService from "~/services/JWTService";
import { v2 as cloudinary } from "cloudinary";
import useragent from "useragent";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "~/models/UserModel";
dotenv.config();
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

const createMany = async (req, res) => {
  try {
    const data = req.body;
    console.log("body: ", data)
    const response = await UserService.createMany(data);
    return res.status(201).json(response);
  }catch(err) {
    return res.status(404).json(err);
  }
}

const loginUser = async (req, res) => {
  try {
    const response = await UserService.loginUser(req.body);
    const refresh_token = response.data.refresh_token;
    // console.log("access_token: ", response.data.access_token)
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,      // Chỉ cho phép truy cập qua HTTP, không thể truy cập từ JavaScript
      // secure: true,        // Chỉ gửi qua kết nối HTTPS
      sameSite: 'Strict',  // Giúp ngăn CSRF 
      maxAge: 24 * 60 * 60 * 1000  // Thời gian tồn tại của cookie,
      // maxAge: 10000  // 

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
    const { page = 1, limit = 9, sort, find, filters } = req.query;
    // console.log(`page: ${page}, limit: ${limit}`);
    // console.log(`sort: ${sort}`);
    // console.log(`filters: ${filters}`);
    const response = await UserService.getAllUser({ page, limit }, sort, find, filters);
    return res.status(200).json(response);
  } catch (error) {
    console.log("error: ", error)
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
    return res.status(404).json(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const imageFile = req.file;
    console.log("avatar file: ", imageFile);
    const data = req.body;

    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, async function (err, user) {
      if (err) {
        // console.log("ërror: ", err)
        return res.status(401).json({
          status: "ERR",
          message: "THE AUTHORIZATION",
        });
      }
      console.log("role: ", user?.role);

      if (user?.role === "user") {
        const response = await UserService.updateUser(userId, data, imageFile, "user");
        const refresh_token = response.data.refresh_token;
        res.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          // secure: true,        
          sameSite: 'Strict',
          maxAge: 24 * 60 * 60 * 1000
          // maxAge: 10000  // 
        })
        return res.status(200).json(response);
      } else if (user?.role === "admin") {
        const response = await UserService.updateUser(userId, data, imageFile, "admin");
        return res.status(200).json(response);
      }
    });

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

    const { productId, name, img, quantity, price } = data;
    if (!productId || !name || !img || !quantity || !price) {
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

const updateCart = async (req, res) => {
  const { id } = req.params;
  const data = req.body; // Thông tin giỏ hàng gửi từ client
  const { productId, quantity } = data;

  // Kiểm tra dữ liệu đầu vào
  if (!productId || !quantity) {
    return res.status(400).json({
      status: "ERR",
      message: "Thiếu thông tin sản phẩm hoặc số lượng!",
    });
  }

  try {
    // Gọi service để cập nhật giỏ hàng
    const response = await UserService.updateCart(id, data);

    // Trả về giỏ hàng đã được cập nhật
    return res.status(200).json({
      status: "OK",
      message: "Cập nhật giỏ hàng thành công!",
      data: response,  // response sẽ là giỏ hàng đã cập nhật
    });
  } catch (error) {
    console.error("Error updating cart: ", error);
    return res.status(500).json({
      status: "ERR",
      message: "Không thể cập nhật giỏ hàng!",
      error: error.message || error,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const { productId } = req.body;
    console.log("Received userId:", userId, "and productId:", productId);  // In ra để kiểm tra
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const response = await UserService.removeFromCart(userId, productId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error removing from cart:", error);  // In ra để kiểm tra lỗi
    return res.status(400).json({
      message: error.message || "An error occurred while removing the product from the cart",
    });
  }
};

const payment = async (req, res) => {
  try {
    const { amount, orderInfo, partnerCode, secretKey, redirectUrl, ipnUrl } = req.body;

    // Call the service that handles MoMo payment creation
    const paymentResponse = await UserService.payment(
      amount,
      orderInfo,
      partnerCode,
      secretKey,
      redirectUrl,
      ipnUrl
    );

    // Return the payment response as JSON
    return res.status(200).json(paymentResponse);
  } catch (error) {
    // Handle errors and return appropriate response
    return res.status(500).json({
      statusCode: 500,
      message: error.message || 'An error occurred while initiating the payment.',
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

const checkPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;
    const response = await UserService.checkPassword(userId, password);
    return res.status(200).json({ response })
  } catch (err) {
    return res.status(400).json({
      message: err
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password, confirmPassword } = req.body;
    const response = await UserService.resetPassword({
      userId,
      password,
      confirmPassword,
    });
    console.log("Updated pass: ", response);
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

const updateShippingAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    // console.log("userId: ", userId);
    // console.log("data: ", data);
    const response = await UserService.updateShippingAddress(userId, data);
    // console.log("res: ", response);
    res.status(200).json(response);
  } catch (err) {
    return res.status(404).json({
      message: err
    })
  }
}


const logout = async (req, res) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    sameSite: 'Strict',
    // secure: true,  // Chỉ dùng nếu bạn đang chạy trên HTTPS
  });
  return res.status(200).json({
    status: "SUCCESS",
    message: "Refresh token đã được xóa",
  });
};

export {
  createUser,
  createMany,
  loginUser,
  refreshToken,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  addToCart,
  updateCart,
  removeFromCart,
  payment,
  clearCart,
  forgotPassword,
  resetPassword,
  sendMessage,
  logout,
  updateShippingAddress,
  checkPassword
};
