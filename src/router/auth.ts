import { Router, Request } from 'express';
import asyncify from 'express-asyncify';

const router = asyncify(Router());

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (code === '1016') {
      res.json({ auth: 'ADMIN' });
    }

    if (code === '0924') {
      res.json({ auth: 'MANAGER' });
    }

    res.json({ auth: 'USER' });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
