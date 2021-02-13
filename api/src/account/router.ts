import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as account from './controller';
import * as accountSchema from './schema';


router.post('/login',
  validator(accountSchema.login, 'body'),
  authToken.verifyExistingToken,
  authAccount.checkPassword,
  account.login
);

router.post('/signup',
  validator(accountSchema.signup, 'body'),
  authToken.verifyExistingToken,
  authAccount.checkExistingUsername,
  account.signup
);

router.post('/generate',
  validator(accountSchema.generate, 'body'),
  authToken.verifyRole(['admin']),
  account.generateAccount
);

router.post('/update',
  validator(accountSchema.update, 'body'),
  authToken.verifyRole(['admin']),
  account.updateAccount
);

router.post('/delete',
  validator(accountSchema.deleteAccount, 'body'),
  authToken.verifyRole(['admin']),
  account.deleteAccount
);

router.post('/logout',
  validator(accountSchema.logout, 'body'),
  account.logout
);

export default router;
