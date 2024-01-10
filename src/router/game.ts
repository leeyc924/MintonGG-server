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
    SELECT array_length(userids, 1) as count, play_dt
    FROM game
    WHERE play_year IN ('${year}') AND play_month IN ('${month}');
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
    SELECT game.play_dt, game.play_part, users.id, users.name, users.age, users.gender, users.address
    FROM game
    JOIN users ON users.id = ANY(game.userids)
    WHERE game.play_dt = '${playDt}'
    ORDER BY users.name ASC;
  `;
  const usersSql = `
    SELECT id, name, age, gender, address
    FROM users ORDER BY "name" ASC;
  `;
  const gameInfo = await sqlToDB(sql);
  const userList = await sqlToDB(usersSql);
  const gameDetail = {
    userList: userList.rows.map(user => ({
      id: user.id,
      userFullName: `${user.name}/${user.age.slice(2, 4)}/${user.address}/${user.gender === 'F' ? '여' : '남'}`,
    })),
    gameList: gameInfo.rows.reduce((acc, cur) => {
      const playPart = cur.play_part;
      const userFullName = `${cur.name}/${cur.age.slice(2, 4)}/${cur.address}/${cur.gender === 'F' ? '여' : '남'}`;
      const index = acc.findIndex((a: any) => a.playPart === playPart);
      if (index > -1) {
        acc[index].userList.push({ id: cur.id, userFullName });
        return acc;
      }

      acc.push({
        playDt: cur.play_dt,
        playPart,
        userList: [{ id: cur.id, userFullName }],
      });
      return acc;
    }, [] as any),
  };

  res.json(gameDetail);
});

router.post('/add', async (req, res) => {
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

export default router;
