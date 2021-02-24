import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as content from './controller';
import * as contentSchema from './schema';


router.post('/create',
  validator(contentSchema.createPost, 'body'),
  authToken.verifyToken,
  content.createPost
);

router.get('/post/:url',
  validator(contentSchema.getPost, 'param'),
  content.getPost
);

router.get('/posts',
  validator(contentSchema.getPosts, 'query'),
  content.getPosts
);

router.get('/:user/posts',
  validator(contentSchema.getUserPosts, 'param'),
  authToken.verifyToken,
  content.getUserPosts
);

router.post('/delete',
  validator(contentSchema.deletePost, 'body'),
  authToken.verifyToken,
  content.deletePost
);

router.post('/edit',
  validator(contentSchema.deletePost, 'body'),
  authToken.verifyToken,
  content.editPost
);

export default router;
