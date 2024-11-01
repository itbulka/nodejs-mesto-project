import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../errors/CustomError';
import errorsCodes from '../utils/constants';
import 'dotenv/config'

const { JWT_SECRET = '' } = process.env;

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(errorsCodes.authError)
      .send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return next(new CustomError('Ошибка авторизации', 401));
  }

  res.locals.user = payload;

  return next();
};
