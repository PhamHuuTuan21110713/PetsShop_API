import Order from "../models/OrderModel.js";
import crypto from "crypto";
import querystring from "querystring";
import dateFormat from "dateformat";
import * as vnp from 'vnpay';
const { VNPay } = vnp;

import dotenv from "dotenv";
dotenv.config();


const vnpay = new VNPay({
    api_Host: 'http://sandbox.vnpayment.vn',
    tmnCode: process.env.VNP_TMN_CODE,
    secureSecret: process.env.VNP_HASH_SECRET,
});

// @desc      Tạo đơn hàng và chuyển hướng đến VNPay
// @route     POST /api/v1/payments/vnpay
// @access    Public
const createOrderAndProcessPayment = async (req, res) => {
    try {
        const { customerId, name, phone, products, totalAmount, shippingFee, note, paymentMethod, address } = req.body;

        // Log đầu vào
        console.log("Received payment details: ", req.body);

        // Kiểm tra thông tin cần thiết
        if (!customerId || !products || !totalAmount || !shippingFee || !address || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // Tạo orderId và thời gian hết hạn thanh toán
        let date = new Date();
        let createDate = dateFormat(date, 'yyyymmddmmHHss');
        let exDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);  // Hết hạn trong 1 ngày
        let expireDate = dateFormat(exDate, 'yyyymmddHHmmss');

        // Tạo đơn hàng
        const order = await Order.create({
            customerId: customerId,
            name,
            phone,
            products: products,
            totalPrice: totalAmount,
            shippingFee: shippingFee,
            note: note,
            paymentMethod: paymentMethod,
            address: address,
            orderDate: new Date(),
            deliveryDate: exDate,
            paymentStatus: 'pending',
            state: false,
        });

        // Log thông tin đơn hàng
        console.log("Created order: ", order);

        // Tạo URL thanh toán VNPay
        const total = totalAmount / 100;
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: total * 100 + shippingFee,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: order._id,
            vnp_OrderInfo: note || 'Thanh toán đơn hàng',
            vnp_OrderType: 'billpayment',
            vnp_ReturnUrl: `http://localhost:8080/api/order/vnpay-return/`,
            vnp_Locale: 'vn',
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        });

        // Log URL thanh toán VNPay
        console.log("VNPay payment URL: ", paymentUrl);

        // Trả về URL thanh toán VNPay cho người dùng
        res.json({
            success: true,
            data: paymentUrl,
        });

    } catch (error) {
        console.error("Error creating order and processing payment: ", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// @desc      Xử lý kết quả thanh toán VNPay (Kiểm tra và cập nhật trạng thái đơn hàng)
// @route     GET /api/v1/payments/vnpay-return
// @access    Public
const vnPayReturn = async (req, res) => {
    try {
        // Xác thực dữ liệu trả về từ VNPay
        const verify = vnpay.verifyReturnUrl(req.query);
        if (!verify.isVerified) {
            console.log('Payment verification failed.');
            return res.redirect(`${process.env.CLIENT_URL}/vnpay_return?status=failed`);
        }
        // Tìm đơn hàng dựa trên vnp_TxnRef
        const order = await Order.findOne({ _id: verify.vnp_TxnRef });
        console.log("Id cua don hang", verify.vnp_TxnRef);
        console.log("Id cua don hang dbms", order._id);
        
        console.log("Vai ca order", order);


        if (!order) {
            console.log("Order not found!");
            return res.redirect(`${process.env.CLIENT_URL}/vnpay_return?status=failed`);
        }

        console.log("Dieu kien de thanh toan nha: ", verify.isSuccess);


        //Cập nhật paymentStatus dựa trên isSuccess từ VNPay
        order.paymentStatus = verify.isSuccess === true ? 'success' : 'failed'; 
        order.state = verify.isSuccess === true ? true : false

        const updatedOrder = await order.save();
        console.log('Updated order:', updatedOrder);

        // const updatedOrder = await Order.findOneAndUpdate(
        //     { _id: order._id }, 
        //     { paymentStatus: 'success',
        //         state: true
        //      }, 
        //     { new: true } // Đảm bảo trả về tài liệu đã cập nhật
        // );
        // console.log('Updated Order:', updatedOrder);
        

        // Chuyển hướng sau khi xử lý
        if (verify.isSuccess === true) {
            return res.redirect(`${process.env.CLIENT_URL}/vnpay_return?status=success&orderId=${verify.vnp_TxnRef}&customerId=${order.customerId}&amount=${verify.vnp_Amount}&transactionNo=${verify.vnp_TransactionNo}`);
        } else {
            return res.redirect(`${process.env.CLIENT_URL}/vnpay_return?status=failed`);
        }
    } catch (error) {
        console.error('Error in vnPayReturn:', error);
        return res.redirect(`${process.env.CLIENT_URL}/vnpay_return?status=error`);
    }
};


const vnPayIPN = async (req, res) => {
    console.log("VNPay IPN URL called");

    try {
        let vnp_Params = req.query;
        console.log("VNPay IPN parameters: ", vnp_Params);

        const secretKey = process.env.VNP_HASH_SECRET;

        // Sắp xếp lại các tham số trước khi tạo chữ ký
        vnp_Params = sortObject(vnp_Params);
        console.log("Sorted parameters for HMAC: ", vnp_Params);

        // Xác thực chữ ký
        const isValidSignature = verifyVNPaySignature(vnp_Params, secretKey);
        if (isValidSignature) {
            console.log("Secure hash matches, processing the payment.");

            const rspCode = vnp_Params['vnp_ResponseCode'];  // Mã phản hồi từ VNPay

            // Xử lý đơn hàng
            const order = await processOrderPayment(vnp_Params, rspCode);

            // Gửi phản hồi cho VNPay
            return res.status(200).json({ RspCode: '00', Message: 'success' });
        } else {
            console.log("Secure hash does not match, returning error.");
            return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
        }
    } catch (error) {
        console.error("Error processing VNPay IPN: ", error);
        return res.status(200).json({ RspCode: '97', Message: 'Error' });
    }
};


// Hàm sắp xếp object để tạo chuỗi query string đúng thứ tự
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

export { createOrderAndProcessPayment, vnPayReturn, vnPayIPN };
