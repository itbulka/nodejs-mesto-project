import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../errors/CustomError';
import errorsCodes from '../utils/constants';
import 'dotenv/config'

const { JWT_SECRET = '' } = process.env;

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.cookies;

  if (!authorization) {
    return next(new CustomError('Необходима авторизация', errorsCodes.authError));
  }

  let payload;

  try {
    payload = jwt.verify(authorization, JWT_SECRET);
  } catch {
    return next(new CustomError('Ошибка авторизации', 401));
  }

  res.locals.user = payload;

  return next();
};
