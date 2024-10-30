// const express = require("express");
// const dotenv = require("dotenv");
// const routes = require("./routes");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bodyParser = bodyParser;
// const cookieParser = cookieParser
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
dotenv.config();


const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

routes(app);

mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then((res) => {
    console.log("Connection succesfully!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Server is running on port ", port);
});
