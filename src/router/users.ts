import { Router } from 'express';
import asyncify from 'express-asyncify';
import userListJson from '../db/userList.json';
import { sqlToDB } from '@db';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  try {
    const sql = 'SELECT * FROM users;';
    const userList = await sqlToDB(sql);
    res.json({ userList: userList.rows });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
