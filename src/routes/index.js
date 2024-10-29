const ProductRouter = require("./ProductRouter");
const UserRouter = require("./UserRouter");
const OrderRouter = require("./OrderRouter");

const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/user", UserRouter);
  app.use("/api/order", OrderRouter);
};

module.exports = routes;
