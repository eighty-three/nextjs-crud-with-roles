import Joi from '@hapi/joi';

export const createPost = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  post: Joi.string().regex(/^[\\/\[\]\(\) \n a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,249}$/).required(),
  title: Joi.string().regex(/^[a-zA-Z0-9_]{1,49}$/).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{1,49}$/).required(),
  tags: Joi.array().items(
    Joi.string().regex(/^[a-zA-Z0-9]{1,99}$/).required()
  ).optional(),
});

export const getPost = Joi.object({
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{1,29}$/).required()
});

export const getPosts = Joi.object({
  page: Joi.number().integer().min(0).max(99999).required(),
  tag: Joi.string().regex(/^[a-zA-Z0-9]{1,99}$/).required(),
  year: Joi.number().integer().min(2020).max(2120).required() // heh
});

export const getUserPosts = Joi.object({
  user: Joi.string().regex(/^[a-zA-Z0-9_]{1,29}$/).required(),
  page: Joi.string().regex(/^[0-9]{1,5}$/).optional()
});

export const deletePost = Joi.object({
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{1,49}$/).required()
});

export const editPost = Joi.object({
  post: Joi.string().regex(/^[\\/\[\]\(\) \n a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,249}$/).required(),
  title: Joi.string().regex(/^[a-zA-Z0-9_]{1,49}$/).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9_-]{1,49}$/).required(),
  newUrl: Joi.string().regex(/^[a-zA-Z0-9_-]{1,49}$/).required(),
  tags: Joi.array().items(
    Joi.string().regex(/^[a-zA-Z0-9]{1,99}$/).required()
  ).optional(),
});
