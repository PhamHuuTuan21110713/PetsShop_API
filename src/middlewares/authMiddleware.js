const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authAdminMiddleware = (req, res, next) => {
  const token = req.headers.access_token?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "THE AUTHORIZATION",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "THE AUTHORIZATION",
      });
    }
    if (user?.isAdmin) {
      next();
    } else {
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

module.exports = {
  authAdminMiddleware,
  authUserMiddleware,
};
