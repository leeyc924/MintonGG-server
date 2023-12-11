import { Router } from 'express';
import asyncify from 'express-asyncify';
import userTierJson from '../db/userTier.json';
import { sqlToDB } from '@db';
import { parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const year = req.query['year'];
  const month = req.query['month'];
  const sql = `
    SELECT array_length(userids, 1)
    FROM game
    WHERE play_year IN ('${year}') AND play_month IN ('${month}');
  `;
  const gameList = await sqlToDB(sql);
  res.json(gameList);
});

router.get('/detail', async (req, res) => {
  const playDt = req.query['playDt'];
  const sql = `
    SELECT game.play_dt, game.play_part, users.id, users.name, users.age, users.gender, users.address
    FROM game
    JOIN users ON users.id = ANY(game.userids)
    WHERE game.play_dt = '${playDt}';
  `;
  const usersSql = `
    SELECT id, name, age, gender, address
    FROM users;
  `;
  const gameInfo = await sqlToDB(sql);
  const userList = await sqlToDB(usersSql);
  const gameDetail = {
    userList: userList.rows,
    gameList: gameInfo.rows.reduce((acc, cur) => {
      const playDt = cur.play_dt;
      const userFullName = `${cur.name}/${cur.age.slice(2, 4)}/${cur.address}/${cur.gender === 'F' ? '여' : '남'}`;
      const index = acc.findIndex((a: any) => a.playDt === playDt);
      if (index > -1) {
        acc[index].userList.push({ id: cur.id, userFullName });
        return acc;
      }

      acc.push({
        playDt,
        playPart: cur.play_part,
        userList: [{ id: cur.id, userFullName }],
      });
      return acc;
    }, [] as any),
  };

  res.json(gameDetail);
});

export default router;

// INSERT INTO game (playDt, userIdList, playPart)
// VALUES ('2023-11-29', ARRAY[1, 2, 3], 1);
