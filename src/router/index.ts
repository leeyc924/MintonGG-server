import express from 'express';
import asyncify from 'express-asyncify';
import authRouter from './auth';
import userRouter from './user';
import tierRouter from './tier';
import gameRouter from './game';

const router = asyncify(express.Router());

router.use(async (req, res, next) => {
  next();
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/tier', tierRouter);
router.use('/game', gameRouter);

export default router;
