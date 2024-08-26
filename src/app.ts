import { errors } from "celebrate";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { CustomError } from "./errors/customError";
import cardsRouter from "./routes/cards";
import usersRouter from "./routes/users";

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mestodb");

app.use((req: Request, res: Response, next: NextFunction) => {
  req.body.user = {
    _id: "66671307644b7c00cf2636e5",
  };

  next();
});

app.use("/", usersRouter);
app.use("/", cardsRouter);

app.use(errors());
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? "На сервере произошла ошибка" : message,
    });
});

app.listen(PORT);
