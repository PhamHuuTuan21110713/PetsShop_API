// const User = require("../models/UserModel");
// const Order = require("../models/OrderModel");
// const bcrypt = require("bcrypt");
// const cloudinary = require("cloudinary").v2;
// const JWTService = require("./JWTService");
// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
import User from '~/models/UserModel';
import Order from '~/models/OrderModel';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import JWTService from './JWTService';
import nodemailer from 'nodemailer';

const createMany = (data) => {
  return new Promise(async (rs, rj) => {
    try {
      const newData = data.map((da, index) => {
        const hashPassword = bcrypt.hashSync(da.password.toString(), 12);
        return {
          ...da,
          password: hashPassword,
          shippingAddress: [
            {
              recipientName: da.name,
              recipientPhone: da.phone,
              address: da.address,
              isDefault: true,
            }
          ],
          cart: [],
        }
      })
      const users = await User.insertMany(newData, { ordered: false });
      if (users.length === data.length) {
        rs({
          status: "OK",
          message: "Tất cả dữ liệu đã được thêm vào",
          data: users
        })
      } else if (users.length > 0) {
        rs({
          status: "OK",
          message: "Thêm thành công, nhưng không thêm được toàn bộ",
          data: users
        })
      }
    } catch (err) {
      console.log(err);
      rj(err);
    }
  })
}

const createUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, password, address, phone, gender } = data;

      // Kiểm tra email và phone đã có trong hệ thống chưa
      const checkUserByEmail = await User.findOne({ email });
      const checkUserByPhone = await User.findOne({ phone });

      if (checkUserByEmail) {
        reject({
          status: "ERR",
          message: "Email đã được sử dụng, vui lòng dùng email khác!",
        });
      } else if (checkUserByPhone) {
        reject({
          status: "ERR",
          message: "Số điện thoại đã được sử dụng, vui lòng dùng số khác!",
        });
      } else {
        // Mã hóa mật khẩu
        const hashPassword = bcrypt.hashSync(password, 12);

        // Tạo người dùng mới với tất cả các trường, bao gồm gender
        const newUser = await User.create({
          name,
          email,
          password: hashPassword,
          address,
          shippingAddress: [
            {
              recipientName: name,
              recipientPhone: phone,
              address,
              isDefault: true,
            }
          ],
          phone,
          gender,  // Thêm gender vào
          cart: [],
        });

        // Tạo access token và refresh token
        const access_token = await JWTService.generateAccessToken({
          id: newUser._id,
          isAdmin: newUser.isAdmin,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          address: newUser.address,
          gender: newUser.gender,  // Thêm gender vào trong token payload
        });

        const refresh_token = await JWTService.generateRefreshToken({
          id: newUser._id,
          isAdmin: newUser.isAdmin,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          address: newUser.address,
          gender: newUser.gender,  // Thêm gender vào trong token payload
        });

        // Trả về thông tin người dùng và token
        if (newUser) {
          resolve({
            status: "OK",
            message: "Tạo tài khoản thành công!",
            data: {
              access_token,
              refresh_token,
              user: {
                _id: newUser._id,
                isAdmin: newUser.isAdmin,
                name: newUser.name,
                email: newUser.email,
                address: newUser.address,
                shippingAddress: newUser.shippingAddress,
                avatar: newUser.avatar,
                phone: newUser.phone,
                gender: newUser.gender,  // Thêm gender vào response
                cart: newUser.cart,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
                state: newUser.state,
              },
            },
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, password } = data;
      const user = await User.findOne({ email });
      if (!user) {
        reject({
          status: "ERR",
          message: "Email không tồn tại!",
        });


      }
      if(user && user.state === 0) {
        reject({
          status:"ERR",
          message:"Tài khoản của bạn đã bị khóa"
        })
      }
      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword) {
        reject({
          status: "ERR",
          message: "Mật khẩu không chính xác!",
        });
      } else {
        const access_token = await JWTService.generateAccessToken({
          id: user._id,
          role: user.role,
          email: user.email,
          phone: user.phone,
        });
        const refresh_token = await JWTService.generateRefreshToken({
          id: user._id,
          role: user.role,
          email: user.email,
          phone: user.phone,
        });

        resolve({
          status: "OK",
          message: "Đăng nhập thành công!",
          data: {
            access_token,
            refresh_token,
            user
          },
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = (paging, sorting, find, condition) => {
  const page = parseInt(paging.page);
  const limit = parseInt(paging.limit);
  // console.log("loi o cond: ",condition)
  let _condition =
    condition ? JSON.parse(condition) :
      {};
  // console.log("loi o sỏt: ",sorting);
  let _sorting = sorting ? JSON.parse(sorting) : { createdAt: -1 };

  if (find) {
    _condition = {
      ..._condition,
      $or: [
        { name: { $regex: find, $options: "i" } },
        { email: { $regex: find, $options: "i" } },
        { address: { $regex: find, $options: "i" } },
        { phone: { $regex: find, $options: "i" } },
        { _id: find.length === 24 ? find : null }
      ],
    }
  }
  return new Promise(async (resolve, reject) => {
    try {
      const userList = await User.find(_condition)
        .sort(_sorting)
        .skip((page - 1) * limit)
        .limit(limit);
      const totalDocuments = await User.countDocuments(_condition);
      const totalPages = Math.ceil(totalDocuments / limit);
      if (userList) {
        resolve({
          status: "OK",
          message: "Lấy danh sách tài khoản thành công!",
          data: userList,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalDocuments,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        reject({
          status: "ERR",
          message: "Không tìm thấy tài khoản!",
        });
      }
      resolve({
        status: "OK",
        message: "Lấy thông tin tài khoản thành công!",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (userId, data, imageFile, role) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, phone, gender, address, state = 1 } = data;
      const checkUserByPhone = await User.findOne({ phone });
      if (checkUserByPhone && checkUserByPhone.phone !== phone) {
        reject({
          status: "ERR",
          message: "Số điện thoại đã tồn tại!",
        });
      }
      const user = await User.findById(userId);
      if (!user) {
        if (imageFile) {
          cloudinary.uploader.destroy(imageFile.filename);
          console.log("deleting prev avatar when can't find user")
        }
        reject({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }
      if (user?.avatar.imageId && imageFile) {
        var imageID = user.avatar.imageId;
        if (imageID) {
          cloudinary.uploader.destroy(imageID);
          console.log("deleting prev avatar when have another")
        }
      }
      const avatar = {
        preview: imageFile?.path || user.avatar.preview,
        imageId: imageFile?.filename || user.avatar.imageId
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          phone,
          avatar,
          gender,
          address,
          state: parseInt(state)
        },
        { new: true, runValidators: true }
      );
      if (role === "admin") {
        resolve({
          status: "OK",
          message: "Cập nhật tài khoản thành công!",
          data: updatedUser
        })
      } else if (role === "user") {

        const access_token = await JWTService.generateAccessToken({
          id: updatedUser._id,
          role: updatedUser.role,
          email: updatedUser.email,
          phone: updatedUser.phone,
        });
        const refresh_token = await JWTService.generateRefreshToken({
          id: updatedUser._id,
          role: updatedUser.role,
          email: updatedUser.email,
          phone: updatedUser.phone,
        });
        resolve({
          status: "OK",
          message: "Cập nhật tài khoản thành công!",
          data: {
            access_token,
            refresh_token,
            user: updatedUser
          },
        });
      }
    } catch (error) {
      if (imageFile) {
        cloudinary.uploader.destroy(imageFile.filename);
        console.log("deleting prev avatar when error")
      }
      reject(error);
    }
  });
};

const updateShippingAddress = (userId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        // console.log("mac loi 1")
        reject({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          shippingAddress: data
        },
        { new: true }
      );
      resolve({
        status: "OK",
        message: "Cập nhật địa chỉ thành công!",
        data: {
          user: updatedUser
        },
      });
    } catch (error) {
      // console.log("macloi2: ", error);
      reject(error);
    }
  });
}

const deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        resolve({
          status: "ERR",
          message: "Không tìm thấy tài khoản!",
        });
      }
      const imageID = user?.avatarPath;
      if (imageID) cloudinary.uploader.destroy(imageID);
      await User.findByIdAndDelete(userId);
      resolve({
        status: "OK",
        message: "Xóa tài khoản thành công!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const addToCart = (userId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { productId, name, img, quantity, price } = data;
      const user = await User.findById(userId);
      if (!user) {
        resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }
      const product = user.cart?.find(
        (item) => item.productId === productId
      );
      if (product && product.productId === productId) {
        product.quantity = parseInt(product.quantity) + parseInt(quantity);
      } else {
        user.cart.push({ productId, name, img, quantity, price });
      }
      await user.save();
      resolve({
        status: "OK",
        message: "Thêm sản phẩm vào giỏ hàng thành công!",
        data: user.cart,
      });
    } catch (error) {
      reject(error);
    }
  });
};


const updateCart = (userId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { productId, quantity } = data;

      // Tìm người dùng theo userId
      const user = await User.findById(userId);
      console.log("productID", productId);

      if (!user) {
        return resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }

      // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
      const product = user.cart?.find(item => item.productId.toString() === productId.toString());

      if (product) {
        // Nếu sản phẩm đã có, cập nhật số lượng
        product.quantity = parseInt(quantity);
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới vào giỏ hàng
        return resolve({
          status: "ERR",
          message: "Sản phẩm không tồn tại trong giỏ hàng!",
        });
      }

      // Lưu giỏ hàng đã được cập nhật
      await user.save();

      // Trả về giỏ hàng đã cập nhật
      resolve({
        status: "OK",
        message: "Cập nhật giỏ hàng thành công!",
        data: user.cart,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: "Lỗi khi cập nhật giỏ hàng!",
        error: error.message || error,
      });
    }
  });
};


const removeFromCart = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo userId
      const user = await User.findById(userId);
      if (!user) {
        // Nếu không tìm thấy người dùng, trả về lỗi
        return resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }

      // Tìm vị trí của sản phẩm trong giỏ hàng
      const productIndex = user.cart.findIndex(
        (item) => item.productId === productId
      );

      // Nếu sản phẩm có trong giỏ hàng
      if (productIndex !== -1) {
        // Xóa sản phẩm khỏi giỏ hàng
        user.cart.splice(productIndex, 1);
        await user.save();  // Lưu lại thay đổi giỏ hàng vào cơ sở dữ liệu

        // Trả về dữ liệu giỏ hàng đã được cập nhật
        return resolve({
          status: "OK",
          message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
          data: user.cart,
        });
      } else {
        // Nếu không tìm thấy sản phẩm trong giỏ hàng
        return resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm trong giỏ hàng!",
        });
      }
    } catch (error) {
      // Xử lý lỗi và trả về thông báo lỗi nếu có
      return reject({
        status: "ERR",
        message: error.message || "Đã xảy ra lỗi trong quá trình xóa sản phẩm!",
      });
    }
  });
};

const payment = (userId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch user information from the database
      const user = await User.findById(userId);
      if (!user) {
        resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
        return;
      }

      const {
        name,
        phone,
        address,
        orderDate,
        deliveryDate,
        price,
        shippingFee,
        totalAmount,
        note,
      } = data;

      // Validate required fields
      if (
        !name ||
        !phone ||
        !address ||
        !orderDate ||
        !deliveryDate ||
        !price
      ) {
        resolve({
          status: "ERR",
          message: "Dữ liệu đơn hàng không được để trống!",
        });
        return;
      }

      // Create the order in the database
      const newOrder = await Order.create({
        customerId: userId,
        name,
        phone,
        address,
        orderDate,
        deliveryDate,
        products: user.cart,
        price,
        shippingFee,
        totalAmount,
        note,
      });

      // Clear the user's cart after creating the order
      if (newOrder) {
        user.cart = [];
        await user.save();

        // Generate payment request to MoMo
        const partnerCode = 'MOMO_PARTNER_CODE'; // Replace with your actual MoMo partner code
        const secretKey = 'MOMO_SECRET_KEY'; // Replace with your actual MoMo secret key
        const redirectUrl = 'YOUR_REDIRECT_URL'; // Replace with your actual redirect URL after payment
        const ipnUrl = 'YOUR_IPN_URL'; // Replace with your actual IPN (Instant Payment Notification) URL

        const orderInfo = `Đơn hàng từ ${name}, điện thoại: ${phone}, tổng giá trị: ${totalAmount}`;
        const amount = totalAmount; // The total amount to pay

        // Generate orderId and requestId
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const extraData = ''; // Any extra data you want to send to MoMo
        const requestType = 'payWithMethod';
        const lang = 'vi';
        const autoCapture = true;

        // Generate raw signature string
        const rawSignature = `accessKey=${partnerCode}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Create the HMAC SHA256 signature
        const signature = crypto.createHmac('sha256', secretKey)
          .update(rawSignature)
          .digest('hex');

        const requestBody = JSON.stringify({
          partnerCode,
          partnerName: "MOMO",
          storeId: "MomoTestStore",
          requestId,
          amount,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          lang: 'vi',
          requestType,
          autoCapture,
          extraData,
          signature
        });

        // MoMo API request options
        const options = {
          method: "POST",
          url: "https://test-payment.momo.vn/v2/gateway/api/query",
          headers: {
            'content-type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          },
          data: requestBody
        };

        try {
          // Send payment request to MoMo
          const response = await axios(options);
          if (response.data && response.data.resultCode === 0) {
            resolve({
              status: "OK",
              message: "Đặt hàng thành công và yêu cầu thanh toán MoMo đã được tạo!",
              data: newOrder,
              paymentUrl: response.data.payUrl // This is the URL to redirect the user for payment
            });
          } else {
            resolve({
              status: "ERR",
              message: "Lỗi khi tạo yêu cầu thanh toán MoMo!",
            });
          }
        } catch (paymentError) {
          resolve({
            status: "ERR",
            message: "Lỗi khi gửi yêu cầu thanh toán MoMo: " + paymentError.message,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};


const clearCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại!",
        });
      }
      user.cart = [];
      await user.save();
      resolve({
        status: "OK",
        message: "Dọn sạch giỏ hàng thành công!",
        data: user.cart
      });
    } catch (error) {
      reject(error);
    }
  });
};

const forgotPassword = (email, operating_system) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        resolve({
          status: "ERR",
          message: "Email không tồn tại!",
        });
      }

      const { reset_token, randomNumber } =
        await JWTService.generateResetPasswordToken(email);

      const from = `PetsShop <${process.env.MY_EMAIL}>`;
      const subject = "Reset password OTP";
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }

        .container {
          width: 80%;
          margin: 0 auto;
          background-color: #f1f1f1;
          padding: 20px;
          border-radius: 4px;
        }

        .otp {
          max-width: 100px;
          background-color: #f50963;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          margin: 20px auto;
        }

        .footer {
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          font-size: 12px;
          text-align: center;
          color: #888;
        }
        </style>
        </head>
        <body>
        <div class="container">
          <h3>Hi ${user.name},</h3>
          <p>You recently requested to reset your password for your PetsShop account. Use the OTP below to reset it. This password reset is only valid for the next 10 minutes.</p>
          <div class="otp">${randomNumber}</div>
          <p>For security, this request was received from a device using "${operating_system}". If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
          <p>Thanks,</p>
          <p>The PetsShop Team</p>
          <div class="footer">
            © 2019 PetsShop. All rights reserved.<br>
            Ho Chi Minh City University of Technology and Education<br>
            1st Street Vo Van Ngan.<br>
            Thu Duc District, Ho Chi Minh City
          </div>
        </div>
        </body>
        </html>
        `;

      let mailOptions = {
        from,
        to: email,
        subject,
        html,
      };

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_EMAIL_PASSWORD,
        },
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          resolve({
            status: "ERR",
            message: error.message,
          });
        } else {
          resolve({
            status: "OK",
            message: `OTP đã được gửi về ${email}!`,
            data: reset_token,
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const checkPassword = (userId, password) => {
  return new Promise(async (rs, rj) => {
    try {

      const user = await User.findById(userId);
      if (!user) {
        rj({
          status: "ERR",
          message: "Không tìm thấy tài khoản!",
        })
      }
      const checkPassword = bcrypt.compareSync(password, user.password);
      // console.log("check-pass: ", checkPassword);
      if (!checkPassword) {
        rj({
          status: "ERR",
          message: "Mật khẩu không đúng",
        })
      } else {
        rs({
          status: "OK",
          message: "Mật khẩu chính xác"
        })
      }
    } catch (err) {
      rj(err);
    }
  })
}

const resetPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId, password, confirmPassword } = data;
      if (password !== confirmPassword) {
        return reject({
          status: "ERR",
          message: "Mật khẩu nhập lại không khớp!",
        });
      }
      const hashPassword = bcrypt.hashSync(password, 12);
      await User.findOneAndUpdate(
        { _id: userId },
        {
          password: hashPassword,
        },
        { new: true }
      );
      return resolve({
        status: "OK",
        message: "Đặt lại mật khẩu thành công!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const sendMessage = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, message } = data;
      if (!name || !email || !message) {
        resolve({
          status: "ERR",
          message: "Các trường không được để trống!",
        });
      }
      const user = await User.findOne({ email });
      if (!user) {
        resolve({
          status: "ERR",
          message: "Email không tồn tại!",
        });
      }

      // Receive message from user
      let customerMailOptions = {
        from: email,
        to: process.env.MY_EMAIL,
        subject: `Message from ${name} - ${email}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
            }
        
            .container {
              width: 80%;
              margin: 0 auto;
              background-color: #f1f1f1;
              padding: 20px;
            }
        
            .message {
              font-size: 1em;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Message from ${name}</h2>
            <p class="message">
              ${message}
            </p>
          </div>
        </body>
        </html>
        `,
      };

      // Send email to user
      const from = `PestsShop <${process.env.MY_EMAIL}>`;
      const subject = "Thanks for your message!";
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
            }

            .container {
              width: 80%;
              margin: 0 auto;
              background-color: #f1f1f1;
              padding: 20px;
            }

            .message {
              font-size: 1em;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h4>Thank You for Your Message</h4>
            <p class="message">
              Dear ${name},
              <br/>
              <br/>
              Thank you for reaching out to us. We appreciate your feedback and will get back to you as soon as possible.
              <br/>
              <br/>
              Best Regards,
              <br/>
              PetsShop Team
            </p>
          </div>
        </body>
        </html>
        `;

      let mailOptions = {
        from,
        to: email,
        subject,
        html,
      };

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_EMAIL_PASSWORD,
        },
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          resolve({
            status: "ERR",
            message: error.message,
          });
        } else {
          transporter.sendMail(customerMailOptions, function (error, info) {
            if (error) {
              resolve({
                status: "ERR",
                message: error.message,
              });
            } else {
              resolve({
                status: "OK",
                message: "Gửi tin nhắn thành công!",
              });
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export {
  createMany,
  createUser,
  loginUser,
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
  updateShippingAddress,
  checkPassword
};