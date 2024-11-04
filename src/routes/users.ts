import { Router } from 'express';
import { Joi, celebrate } from 'celebrate';
import {
  getAllUsers, getCurrentUser, getUser, updateUserAvatar, updateUserData,
} from '../controllers/users';

const router = Router();

router.get('/users', getAllUsers);

router.get('/users/me', getCurrentUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(200),
  }),
}), updateUserData);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required(),
  }),
}), updateUserAvatar);

export default router;
