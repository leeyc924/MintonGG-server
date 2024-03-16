import { Router } from 'express';
import asyncify from 'express-asyncify';
import { commit, getTransaction, rollback, sqlExecSingleRow, sqlToDB } from '@db';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const playDt = req.query['playDt'];

  const sql = `
    SELECT g.play_dt, users.id,
    CONCAT_WS('/', 
      users.name,
      RIGHT(users.age, 2),
      users.address,
      CASE
        WHEN users.gender = 'M' THEN '남'
        WHEN users.gender = 'F' THEN '여'
        ELSE users.gender
      END
    ) AS full_name
    FROM game as g
    JOIN users ON users.id = ANY(g.userids)
    WHERE g.play_dt = '${playDt}'
    ORDER BY g.play_dt ASC;
  `;
  const response = await sqlToDB(sql);
  const gameList = response.rows;
  res.json({ gameList });
});

router.post('/upsert', async (req, res) => {
  const client = await getTransaction();
  try {
    const play_dt = req.body['play_dt'];
    const userids = req.body['userids']?.join(', ');
    const play_month = dayjs(play_dt).format('MM');
    const play_year = dayjs(play_dt).format('YYYY');

    const sql = userids ? `
      INSERT INTO game (play_dt, userids, play_month, play_year)
      VALUES ('${play_dt}', '{${userids}}', '${play_month}', '${play_year}')
      ON CONFLICT (play_dt) DO UPDATE
      SET userids = '{${userids}}';
    ` : `
      DELETE FROM game
      WHERE part_dt = '${play_dt}';
    `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.json();
  } catch (error) {
    await rollback(client);
    throw error;
  }
});

router.post('/remove', async (req, res) => {
  const client = await getTransaction();
  try {
    const play_dt = req.body['play_dt'];
    const userids = req.body['userids']?.join(', ');
    const sql = `
      UPDATE game SET userids = '{${userids}}'
      WHERE play_dt = '${play_dt}';
    `;
    await sqlExecSingleRow(client, sql);
    await commit(client);
    res.json();
  } catch (error) {
    await rollback(client);
    throw error;
  }
});

router.get('/cdc', async (req, res) => {
  const sql = `
      SELECT *
      FROM game
    `;
  const gameList = await sqlToDB(sql);
  const a = gameList.rows.reduce((acc, cur) => {
    const index = acc.findIndex((prev: any) => prev.play_dt === cur.play_dt);
    if (index > -1) {
      const userids = acc[index].userids.concat(cur.userids);
      acc[index].userids = Array.from(new Set(userids));
      return acc;
    }

    acc.push({
      play_dt: cur.play_dt,
      userids: cur.userids,
      reg_dt: cur.reg_dt,
      mod_dt: cur.mod_dt,
      play_month: cur.play_month,
      play_year: cur.play_year,
    });
    return acc;
  }, [] as any);

  const sort = a.sort((l: any, r: any) => (l.play_dt > r.play_dt ? 1 : -1));

  let value = sort.reduce((acc: any, cur: any) => {
    acc.push(
      `('${cur.play_dt}', '{${cur.userids.join(', ')}}', '${dayjs(cur.reg_dt).toISOString()}', '${dayjs(
        cur.mod_dt,
      ).toISOString()}', '${cur.play_month}', '${cur.play_year}')`,
    );
    return acc;
  }, []);

  value = value.join(',') + ';';
  const insert = `
      INSERT INTO game (play_dt, userids, reg_dt, mod_dt, play_month, play_year)
      VAlUES ${value}
  `;
  const gameInfo = await sqlToDB(insert);
  res.json();
});

export default router;
