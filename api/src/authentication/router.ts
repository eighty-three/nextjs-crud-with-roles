import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as authentication from './controller';
import * as authenticationSchema from './schema';


router.post('/login',
  validator(authenticationSchema.login, 'body'),
  authToken.verifyExistingToken,
  authAccount.checkPassword,
  authentication.login
);

router.post('/signup',
  validator(authenticationSchema.signup, 'body'),
  authToken.verifyExistingToken,
  authAccount.checkExistingUsername,
  authentication.signup
);

router.post('/logout',
  validator(authenticationSchema.logout, 'body'),
  authentication.logout
);

export default router;
