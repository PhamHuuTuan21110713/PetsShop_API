
import ReviewRouter from './ReviewRouter.js';
import ProductRouter from "./ProductRouter";
import UserRouter from "./UserRouter";
import OrderRouter from "./OrderRouter";
import AuthenRouter from './AuthenRouter';
import CategoryRouter from './CategoryRouter.js'
const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/users", UserRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/review", ReviewRouter);
  app.use("/api", AuthenRouter);
  app.use("/api/categories", CategoryRouter)
};

export default routes;