import express from 'express';
import authRouter from './auth';
import userRouter from './user';
import tierRouter from './tier';

const router = express.Router();

router.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(403).json(error);
  }
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/tier', tierRouter);

export default router;
