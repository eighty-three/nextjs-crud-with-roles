import Joi from '@hapi/joi';
const roles = ['new', 'user', 'moderator', 'admin'];

export const generate = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  password: Joi.string().min(1).max(200).required(),
  role: Joi.string().valid(...roles).required()
});

export const deleteAccount = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required()
});

export const changeRole = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  role: Joi.string().valid(...roles).required()
});

export const changePassword = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  password: Joi.string().min(1).max(200).required(),
  newPassword: Joi.string().min(1).max(200).required()
});
