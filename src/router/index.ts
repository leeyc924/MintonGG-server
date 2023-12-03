import express from 'express';
import asyncify from 'express-asyncify';
import jwt from 'jsonwebtoken';
import authRouter from './auth';
import userRouter from './user';
import tierRouter from './tier';
import { CustomError } from '@utils';

const router = asyncify(express.Router());

router.use(async (req, res, next) => {
  next();
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/tier', tierRouter);

export default router;
