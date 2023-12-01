import { Router } from 'express';
import asyncify from 'express-asyncify';
import { sqlToDB } from '@db';
import { parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  try {
    const sql = 'SELECT * FROM users ORDER BY "position" ASC, "name" ASC ;';
    const userList = await sqlToDB(sql);
    res.json({ userList: userList.rows });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get('/detail', async (req, res) => {
  try {
    const id = parseToNumber(req.query['id']);
    const sql = `SELECT * FROM users WHERE "id" = ${id};`;
    const userInfo = await sqlToDB(sql);
    if (userInfo.rowCount === 0) {
      throw new Error('no user');
    }

    res.json({ userInfo: userInfo.rows[0] });
  } catch (error) {
    res.status(500).json(error?.toString());
  }
});

router.post('/add', async (req, res) => {
  try {
    const name = req.body['name'];
    const gender = req.body['gender'];
    const address = req.body['address'];
    const age = req.body['age'];
    const join_dt = req.body['join_dt'];

    const sql = `INSERT INTO 
      users (name, gender, age, address, join_dt)
      values ('${name}','${gender}','${age}', '${address}', '${join_dt}');`;
    await sqlToDB(sql);
    res.status(200).json();
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/edit', async (req, res) => {
  try {
    const id = parseToNumber(req.body['id']);
    const name = req.body['name'];
    const gender = req.body['gender'];
    const age = req.body['age'];
    const address = req.body['address'];
    const join_dt = dayjs(req.body['join_dt']).format('YYYY-MM-DD');

    const sql = `UPDATE users SET
    "name" = '${name}',
    gender = '${gender}',
    age = '${age}',
    address = '${address}',
    join_dt = '${join_dt}',
    mod_dt = CURRENT_TIMESTAMP
    WHERE "id" = ${id}
    ;`;
    await sqlToDB(sql);
    res.status(200).json();
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/remove', async (req, res) => {
  try {
    const id = parseToNumber(req.body['id']);
    const sql = `DELETE FROM users WHERE "id" = ${id};`;
    await sqlToDB(sql);
    res.status(200).json();
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
