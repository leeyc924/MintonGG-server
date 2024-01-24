import { Router } from 'express';
import asyncify from 'express-asyncify';
import userTierJson from '../db/userTier.json';
import { commit, getTransaction, rollback, sqlExecSingleRow, sqlToDB } from '@db';
import { parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const year = req.query['year'];
  const month = req.query['month'];
  const sql = `
    SELECT count(DISTINCT user_id) as count, play_dt
    FROM (
      SELECT DISTINCT unnest(userids) AS user_id, play_dt, play_part
      FROM game
      WHERE play_year = '${year}' AND play_month = '${month}' AND play_part IN (1, 2, 3, 4)
    ) AS subquery
    GROUP BY play_dt;
  `;
  const gameInfo = (await sqlToDB(sql)).rows
    .map(row => ({ userCount: row.count, playDt: row.play_dt }))
    .reduce((acc, cur) => {
      acc[cur.playDt] = cur.userCount;
      return acc;
    }, {} as any);

  res.json(gameInfo);
});

router.get('/detail', async (req, res) => {
  const playDt = req.query['playDt'];
  const sql = `
    SELECT game.play_dt, game.play_part, users.id,
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
    FROM game
    JOIN users ON users.id = ANY(game.userids)
    WHERE game.play_dt = '${playDt}'
    ORDER BY users.name ASC;
  `;
  const usersSql = `
    SELECT id,
    CONCAT_WS('/', 
      u.name,
      RIGHT(u.age, 2),
      u.address,
      CASE
        WHEN u.gender = 'M' THEN '남'
        WHEN u.gender = 'F' THEN '여'
        ELSE u.gender
      END
    ) AS full_name
    FROM users u ORDER BY "name" ASC;
  `;
  const gameInfo = await sqlToDB(sql);
  const userList = await sqlToDB(usersSql);
  const gameDetail = {
    userList: userList.rows,
    gameList: gameInfo.rows.reduce((acc, cur) => {
      const playPart = cur.play_part;
      const index = acc.findIndex((a: any) => a.playPart === playPart);
      if (index > -1) {
        acc[index].userList.push({ id: cur.id, full_name: cur.full_name });
        return acc;
      }

      acc.push({
        playDt: cur.play_dt,
        playPart,
        userList: [{ id: cur.id, full_name: cur.full_name }],
      });
      return acc;
    }, [] as any),
  };

  res.json(gameDetail);
});

router.post('/upsert', async (req, res) => {
  const client = await getTransaction();
  try {
    const play_dt = req.body['play_dt'];
    const userids = req.body['userids']?.join(', ');
    const play_part = req.body['play_part'];
    const play_month = dayjs(play_dt).format('MM');
    const play_year = dayjs(play_dt).format('YYYY');

    const sql = userids ? `
      INSERT INTO game (play_part_dt, play_dt, userids, play_part, play_month, play_year)
      VALUES ('${play_part}-${play_dt}', '${play_dt}', '{${userids}}', '${play_part}', '${play_month}', '${play_year}')
      ON CONFLICT (play_part_dt) DO UPDATE
      SET userids = '{${userids}}';
    ` : `
      DELETE FROM game
      WHERE play_part_dt = '${play_part}-${play_dt}';
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
    const play_part = req.body['play_part'];
    const userids = req.body['userids']?.join(', ');
    const sql = `
      UPDATE game SET userids = '{${userids}}'
      WHERE play_dt = '${play_dt}' AND play_part = '${play_part}';
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
