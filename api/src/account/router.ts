import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken, authAccount } from '@authMiddleware/index';

import * as account from './controller';
import * as accountSchema from './schema';


router.post('/generate',
  validator(accountSchema.generate, 'body'),
  authToken.verifyRole(['admin']),
  account.generateAccount
);

router.post('/delete',
  validator(accountSchema.deleteAccount, 'body'),
  authToken.verifyRole(['admin']),
  account.deleteAccount
);

router.get('/list',
  authToken.verifyRole(['admin']),
  account.getAccounts
);

router.post('/changeRole',
  validator(accountSchema.changeRole, 'body'),
  authToken.verifyRole(['admin']),
  account.changeRole
);

router.post('/changePassword',
  validator(accountSchema.changePassword, 'body'),
  authToken.verifyToken,
  authAccount.checkPassword,
  account.changePassword
);

router.post('/setPassword',
  validator(accountSchema.setPassword, 'body'),
  authToken.verifyRole(['admin']),
  account.setPassword
);

export default router;
