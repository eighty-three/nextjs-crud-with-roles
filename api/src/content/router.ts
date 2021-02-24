import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as content from './controller';
import * as contentSchema from './schema';


router.post('/create',
  validator(contentSchema.createPost, 'body'),
  authToken.verifyRole(['user', 'mod', 'admin']),
  content.createPost
);

router.get('/post/:url',
  validator(contentSchema.getPost, 'params'),
  content.getPost
);

router.get('/posts',
  validator(contentSchema.getPosts, 'query'),
  content.getPosts
);

router.get(['/posts/:user', '/posts/:user/:page'],
  validator(contentSchema.getUserPosts, 'params'),
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
