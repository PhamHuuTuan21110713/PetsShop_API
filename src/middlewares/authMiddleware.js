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
      // console.log("thanhcong")
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
  const token = req.headers.access_token?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "THE AUTHORIZATION",
    });
  }
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
    if (user?.isAdmin || user?.id === userId) {
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
