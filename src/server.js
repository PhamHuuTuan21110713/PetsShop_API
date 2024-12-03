
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];
dotenv.config();


const app = express();
const port = process.env.port || 5000;

app.use(cors({
  // origin: 'http://localhost:5173', // Địa chỉ frontend của bạn
  origin: allowedOrigins,
  credentials: true,               // Để cho phép gửi cookie qua CORS
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

routes(app);

// EXPRESS + SOCKET
const httpServer = createServer(app);

let onlineUsers = [];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Một mảng các origin được phép
    methods: ["GET", "POST"], // Các phương thức được phép
    credentials: true,       // Cho phép gửi cookie và thông tin xác thực
  },
});

io.on("connection", (socket) => {
    console.log("new socket connection: ", socket.id)
    
    socket.on("addNewUser", (userId) => {
      !onlineUsers.some(user => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id
      })
      console.log("online users: ", onlineUsers);
    })

    socket.on("sendMessage", (message) => {
      const user = onlineUsers.find((onlineuser) => onlineuser.userId === message.recipientId);
      if(user) {
        console.log(`user get message ${user.userId} `)
        io.to(user.socketId).emit("getMessage", message);
      }
    })
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log(`Socket ID${socket.id} has disconnected`)
    })
})

mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then((res) => {
    console.log("Connection succesfully!");
  })
  .catch((err) => {
    console.log(err);
  });

httpServer.listen(port,() => {
    console.log("Server is running on port ", port);
  });

// app.listen(port, () => {
//   console.log("Server is running on port ", port);
// });
