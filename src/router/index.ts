import express from 'express';
import authRouter from './auth';

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(403).json(error);
  }
});

router.use('/auth', authRouter);

router.post('/*', async (req, res) => {
  res.status(500).send();
});

export default router;
