
import ReviewRouter from './ReviewRouter.js';
import ProductRouter from "./ProductRouter";
import UserRouter from "./UserRouter";
import OrderRouter from "./OrderRouter";
import AuthenRouter from './AuthenRouter';
import CategoryRouter from './CategoryRouter.js'
import PromotionRouter from './PromotionRouter.js';
import ServiceRouter from './ServiceRouter.js';
import ShopInformationRouter from './ShopInformationRouter.js';
import BookingRouter from './BookingRouter.js';
const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/users", UserRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/review", ReviewRouter);
  app.use("/api", AuthenRouter);
  app.use("/api/categories", CategoryRouter);
  app.use("/api/promotions", PromotionRouter);
  app.use("/api/services", ServiceRouter);
  app.use("/api/shop", ShopInformationRouter);
  app.use("/api/bookings",BookingRouter );
};

export default routes;