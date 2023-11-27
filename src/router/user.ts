import { Router } from 'express';
import asyncify from 'express-asyncify';
import userListJson from '../db/userList.json';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  try {
    const userList = userListJson;
    res.json({ userList });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
