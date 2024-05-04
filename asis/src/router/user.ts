import { Router } from 'express';
import asyncify from 'express-asyncify';
import { commit, getTransaction, rollback, sqlExecMultipleRows, sqlExecSingleRow, sqlToDB } from '@db';
import { CustomError, parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const month = dayjs().format('MM');
  const sql = `
    SELECT
      u.id,
      u.position,
      CONCAT_WS('/', u.name,
        RIGHT(u.age, 2),
        u.address,
        CASE
          WHEN u.gender = 'M' THEN '남'
          WHEN u.gender = 'F' THEN '여'
          ELSE u.gender
        END
      ) AS full_name,
      u.join_dt,
      (
        SELECT MAX(g.play_dt)
        FROM game g
        WHERE u.id = ANY(g.userids)
      ) AS play_dt
    FROM
      users u
    GROUP BY
      u.id, u.name, u.age, u.address, u.gender, u.join_dt
    ORDER BY
      u."position" ASC, u."name" ASC;
  `;

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
    `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.json();
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
  const position = req.body['position'];
  const join_dt = dayjs(req.body['join_dt']).format('YYYY-MM-DD');

  const sql = `UPDATE users SET
    "name" = '${name}',
    gender = '${gender}',
    age = '${age}',
    address = '${address}',
    join_dt = '${join_dt}',
    position = '${position}',
    mod_dt = CURRENT_TIMESTAMP
    WHERE "id" = ${id}
    ;`;
  await sqlToDB(sql);
  res.json();
});

router.post('/remove', async (req, res) => {
  const client = await getTransaction();
  try {
    const id = parseToNumber(req.body['id']);
    const sql = `
    DELETE FROM users WHERE "id" = ${id};
  `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.json();
  } catch (error) {
    await rollback(client);
    throw error;
  }
});

export default router;
