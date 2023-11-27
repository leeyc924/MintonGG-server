import express from 'express';
import authRouter from './auth';
import usersRouter from './users';
import tierRouter from './tier';

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(403).json(error);
  }
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/tier', tierRouter);

export default router;
