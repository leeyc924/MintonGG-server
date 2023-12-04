import { Router } from 'express';
import asyncify from 'express-asyncify';
import { commit, getTransaction, rollback, sqlExecMultipleRows, sqlExecSingleRow, sqlToDB } from '@db';
import { CustomError, parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const sql = 'SELECT * FROM "users" ORDER BY "position" ASC, "name" ASC ;';
  const userList = await sqlToDB(sql);
  res.json({ userList: userList.rows });
});

router.get('/detail', async (req, res) => {
  const id = parseToNumber(req.query['id']);
  const sql = `SELECT * FROM users WHERE "id" = ${id};`;
  const userInfo = await sqlToDB(sql);
  if (userInfo.rowCount === 0) {
    throw new CustomError('NotFoundUser', 500, 'no user');
  }

  res.json({ userInfo: userInfo.rows[0] });
});

router.post('/add', async (req, res) => {
  const client = await getTransaction();
  try {
    const name = req.body['name'];
    const gender = req.body['gender'];
    const address = req.body['address'];
    const age = req.body['age'];
    const join_dt = req.body['join_dt'];

    const sql = `
      INSERT INTO 
      users (name, gender, age, address, join_dt)
      VALUES ('${name}','${gender}','${age}', '${address}', '${join_dt}');

      INSERT INTO users_tier (user_id, tier)
      VALUES (CURRVAL('users_id_seq'), 0);
    `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.status(200).json();
  } catch (error) {
    await rollback(client);
    throw error;
  }
});

router.post('/edit', async (req, res) => {
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
});

router.post('/remove', async (req, res) => {
  const client = await getTransaction();
  try {
    const id = parseToNumber(req.body['id']);
    const sql = `
    DELETE FROM users WHERE "id" = ${id};
    DELETE FROM users_tier WHERE "user_id" = ${id};
  `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.status(200).json();
  } catch (error) {
    await rollback(client);
    throw error;
  }
});

export default router;
