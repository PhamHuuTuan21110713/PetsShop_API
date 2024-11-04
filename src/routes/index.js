import ProductRouter from './ProductRouter.js';
import UserRouter from './UserRouter.js';
import OrderRouter from './OrderRouter.js';
import ReviewRouter from './ReviewRouter.js';
import CategoryRouter from './CategoryRouter.js';

const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/user", UserRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/review", ReviewRouter);
  app.use("/api/category", CategoryRouter);
};

module.exports = routes;