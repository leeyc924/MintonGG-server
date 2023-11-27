import { Router } from 'express';
import asyncify from 'express-asyncify';
import userTierJson from '../db/userTier.json';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  try {
    const tierList = userTierJson;
    res.json({ tierList });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
