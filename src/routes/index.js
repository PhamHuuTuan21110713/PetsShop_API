
import ProductRouter from "./ProductRouter";
import UserRouter from "./UserRouter";
import OrderRouter from "./OrderRouter";
import AuthenRouter from './AuthenRouter';
import reviewRouter from './ReviewRouter';
const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/users", UserRouter);
  app.use("/api/order", OrderRouter);

  app.use("/api", AuthenRouter);

  app.use("/api/review", reviewRouter);

};

export default routes;