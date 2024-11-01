import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Cards from '../models/card';
import CustomError from '../errors/CustomError';
import errorsCodes from '../utils/constants';

export const getAllCards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cards = await Cards.find({});
    return res.send(cards);
  } catch (err) {
    return next(err);
  }
};

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, link } = req.body;
    const user = res.locals.user._id;
    const card = await Cards.create({ name, link, owner: user });
    return res.status(201).send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(
        new CustomError('Введены некорректные данные', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const card = await Cards.findById(req.params.cardId).orFail(() => {
      throw new CustomError(
        'Карточка с указанным id не найдена.',
        errorsCodes.notFoundError,
      );
    });

    if (card.owner !== res.locals.user._id) {
      return res.send({ response: 'Вы не можете удалить данную карточку' });
    }

    await card.deleteOne();
    return res.send({ result: true });
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(
        new CustomError('Введены некорректные данные.', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const likeCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const card = await Cards.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: res.locals.user._id } },
      { new: true },
    ).orFail(
      () => new CustomError(
        'Карточка с указанным id не найдена.',
        errorsCodes.notFoundError,
      ),
    );
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(
        new CustomError('Введены некорректные данные.', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};

export const dislikeCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const card = await Cards.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: res.locals.user._id } },
      { new: true },
    ).orFail(
      () => new CustomError(
        'Карточка с указанным id не найдена.',
        errorsCodes.notFoundError,
      ),
    );
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(
        new CustomError('Введены некорректные данные.', errorsCodes.reqError),
      );
    }
    return next(err);
  }
};
