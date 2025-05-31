
import ReviewRouter from './ReviewRouter.js';
import ProductRouter from "./ProductRouter.js";
import BlogRouter from "./BlogRouter.js";
import UserRouter from "./UserRouter.js";
import OrderRouter from "./OrderRouter.js";
import AuthenRouter from './AuthenRouter.js';
import CategoryRouter from './CategoryRouter.js'
import PromotionRouter from './PromotionRouter.js';
import ServiceRouter from './ServiceRouter.js';
import ShopInformationRouter from './ShopInformationRouter.js';
import BookingRouter from './BookingRouter.js';
import EmailRouter from './EmailRouter.js';
import ChatRouter from './ChatRouter.js';
import MessageRouter from './MessageRouter.js';
import NotificationRouter from './NotificationRouter.js';
import RecommendRouter from './RecommendRouter.js'
import GoogleAuthRouter from "./GoogleAuthRouter.js"
const routes = (app) => {
  app.use("/api/product", ProductRouter);
  app.use("/api/blogs", BlogRouter);
  app.use("/api/users", UserRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/review", ReviewRouter);
  app.use("/api", AuthenRouter);
  app.use("/api/categories", CategoryRouter);
  app.use("/api/promotions", PromotionRouter);
  app.use("/api/services", ServiceRouter);
  app.use("/api/shop", ShopInformationRouter);
  app.use("/api/bookings",BookingRouter );
  app.use("/api", EmailRouter);
  app.use("/api/chats", ChatRouter);
  app.use("/api/messages", MessageRouter);
  app.use("/api/notifications", NotificationRouter);
  app.use("/api/recommends", RecommendRouter );
  app.use("/auth/google", GoogleAuthRouter)
};

export default routes;