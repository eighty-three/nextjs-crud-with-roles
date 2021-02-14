import express from 'express';
import validator from '@utils/validator';
const router = express.Router();

import { authToken } from '@authMiddleware/index';

import * as account from './controller';
import * as accountSchema from './schema';


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

export default router;
