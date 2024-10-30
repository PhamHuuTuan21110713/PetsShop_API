import ProductRouter from "./ProductRouter";
import UserRouter from "./UserRouter";
import OrderRouter from "./OrderRouter";

const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/user", UserRouter);
  app.use("/api/order", OrderRouter);
};

export default routes;
