
import ProductRouter from "./ProductRouter";
import UserRouter from "./UserRouter";
import OrderRouter from "./OrderRouter";
import AuthenRouter from './AuthenRouter';

const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/users", UserRouter);
  app.use("/api/order", OrderRouter);

  app.use("/api", AuthenRouter);

  app.use("/api/review", reviewRouter);

};

module.exports = routes;