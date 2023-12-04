import { Router } from 'express';
import asyncify from 'express-asyncify';
import userTierJson from '../db/userTier.json';
import { sqlToDB } from '@db';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  const sql = `
    SELECT users.name, users.address, users.gender, users.age, users_tier.tier, users_tier.id
    FROM users
    JOIN users_tier ON users.id = users_tier.user_id
    ORDER BY CASE WHEN users_tier.tier = 0 THEN 1 ELSE 0 END, users_tier.tier ASC, users.name ASC;
  `;
  const userList = await sqlToDB(sql);
  res.json({ userList: userList.rows });
});

export default router;
