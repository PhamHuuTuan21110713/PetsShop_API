// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authAdminMiddleware = (req, res, next) => {
  // const token = req.headers.access_token?.split(" ")[1];
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "THE AUTHORIZATION",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      // console.log("loi1", err);
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
    if (user?.role === "admin") {
      console.log("thanhcong voi admin")
      next();
    } else {
      // console.log("loi2")
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader.split(' ')[1];
  // console.log(token);
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "THE AUTHORIZATION",
    });
  }
  const userId = req.params.id;
  // console.log(userId)
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
    if (user?.role === "admin" || user?.id === userId) {
      console.log("thanh cong voi user or admin")
      next();
    } else {
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
  });
};

export {
  authAdminMiddleware,
  authUserMiddleware,
};
