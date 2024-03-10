import { Router } from 'express';
import asyncify from 'express-asyncify';
import { sqlToDB } from '@db';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/new-user', async (req, res) => {
  const month = dayjs().format('M');
  const year = dayjs().format('YYYY');
  const sql = `
    SELECT
      id,
      CONCAT_WS('/', name,
        RIGHT(age, 2),
        address,
        CASE
          WHEN gender = 'M' THEN '남'
          WHEN gender = 'F' THEN '여'
          ELSE gender
        END
      ) AS full_name,
      TO_CHAR(join_dt, 'DD') as join_dt
    FROM users
    WHERE EXTRACT(YEAR FROM join_dt) = ${year}
    AND EXTRACT(MONTH FROM join_dt) = ${month}
    ORDER BY
      join_dt ASC, name ASC;
  `;

  const userList = (await sqlToDB(sql)).rows.reduce((acc, cur) => {
    const joinDt = cur.join_dt;
    if (acc[joinDt]) {
      acc[joinDt].push(cur);
      return acc;
    }

    acc = { ...acc, [joinDt]: [cur] };
    return acc;
  }, {});
  res.json({ userList });
});

router.get('/best-user', async (req, res) => {
  const month = dayjs().format('MM');
  const year = dayjs().format('YYYY');
  const sql = `
    SELECT 
      u.id,
      CONCAT_WS('/', u.name,
        RIGHT(u.age, 2),
        u.address,
        CASE
          WHEN u.gender = 'M' THEN '남'
          WHEN u.gender = 'F' THEN '여'
          ELSE u.gender
        END
      ) AS full_name,
      COUNT(*) AS play_count
    FROM users u
    JOIN (
      SELECT unnest(userids) AS user_id
      FROM game2
      WHERE play_month = '${month}' AND play_year = '${year}'
    ) g ON u.id = g.user_id
    GROUP BY u.id, u.name, u.age, u.address, u.gender
    ORDER BY play_count DESC, u.name ASC
    LIMIT 5;
  `;
  const userList = await sqlToDB(sql);
  res.json({ userList: userList.rows });
});

export default router;