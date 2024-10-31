import ProductRouter from './ProductRouter.js';
import UserRouter from './UserRouter.js';
import OrderRouter from './OrderRouter.js';
import reviewRouter from './ReviewRouter.js';

const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/user", UserRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/review", reviewRouter);
};

module.exports = routes;