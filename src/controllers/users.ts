import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Users from '../models/user';
import CustomError from '../errors/CustomError';
import errorsCodes from '../utils/constants';
import 'dotenv/config'

const { JWT_SECRET = '' } = process.env;

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await Users.find({});
    return res.send(users);
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.params.userId);
  try {
    const userData = await Users.findById(req.params.userId).select('-password').orFail(() => new CustomError('Пользователь с указанным id не найден', errorsCodes.notFoundError));
    return res.send(userData);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(
        new CustomError('Введены некорректные данные.', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const userData = await Users.create({
      name,
      about,
      avatar,
      email,
      password: hashPass,
    });
    const user = userData.toObject() as any;
    delete user.password;

    return res.status(201).send(user);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(
        new CustomError(
          'Адрес электронной почты уже зарегестрирован',
          errorsCodes.authError,
        ),
      );
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return next(
        new CustomError('Введите корректные данные', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, about } = req.body;
    const user = res.locals.user._id;
    const userData = await Users.findByIdAndUpdate(
      user,
      { name, about },
      { new: true, runValidators: true },
    ).orFail(() => new CustomError('Пользователь с указанным id не найден', errorsCodes.notFoundError));
    return res.send(userData);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(
        new CustomError('Введите корректные данные', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const updateUserAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { avatar } = req.body;
    const user = res.locals.user._id;
    const userData = await Users.findByIdAndUpdate(
      user,
      { avatar },
      { new: true, runValidators: true },
    ).orFail(() => new CustomError('Пользователь с указанным id не найден', errorsCodes.notFoundError));
    return res.send(userData);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(
        new CustomError('Введите корректные данные', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const userData = await Users.findOne({ email }).select('+password');
    if (!userData) {
      throw new CustomError('Неправильные данные почты или пароля', errorsCodes.authError);
    }
    const matched = await bcrypt.compare(password, userData!.password);
    if (!matched) {
      throw new CustomError('Неправильные данные почты или пароля', errorsCodes.authError);
    }
    const token = jwt.sign({ _id: userData._id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    return res
      .cookie('authorization', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      })
      .send({ result: true });
  } catch (err) {
    return next(err);
  }
};
