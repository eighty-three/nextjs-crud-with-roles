import express from 'express';
const router = express.Router();

// Middleware
import { authToken, authAccount } from '@authMiddleware/index';
router.post('/verify', authToken.verifyToken, authAccount.verifyUser);


// Routes
import accountRouter from './account/router';
router.use('/account', accountRouter);

import authRouter from './auth/router';
router.use('/auth', authRouter);

export default router;
