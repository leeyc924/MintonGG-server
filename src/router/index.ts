import express from 'express';
import asyncify from 'express-asyncify';
import authRouter from './auth';
import userRouter from './user';
import gameRouter from './game';
import homeRouter from './home';
import jwt from 'jsonwebtoken';

const router = asyncify(express.Router());

router.use(async (req, res, next) => {
  const originalUrl = req.originalUrl;
  if (originalUrl.includes('auth')) {
    next();
    return;
  }

  const accessToken = req.cookies['accessToken'];
  await new Promise((resolve, reject) => {
    jwt.verify(accessToken as string, process.env.JWT_SECRET || '', (err, decodedData) => {
      if (err) {
        console.log('jwt err', err);
        reject(err);
      }

      resolve(decodedData);
    });
  });

  next();
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/game', gameRouter);
router.use('/home', homeRouter);

export default router;
