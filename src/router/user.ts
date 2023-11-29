import { Router } from 'express';
import asyncify from 'express-asyncify';
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

router.post('/edit', async (req, res) => {
  try {
    const id = req.body['id'];
    const name = req.body['name'];
    const gender = req.body['gender'];
    const address = req.body['address'];
    const join_dt = req.body['join_dt'];

    const sql = `UPDATE users SET
    "name" = '${name}',
    gender = '${gender}',
    address = ${address},
    join_dt = ${join_dt},
    mod_dt = CURRENT_TIMESTAMP
    WHERE "id" = '${id}'
    ;`;
    await sqlToDB(sql);
    res.json(true);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
