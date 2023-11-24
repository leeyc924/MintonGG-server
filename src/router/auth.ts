import { CustomError } from '@@utils';
import { Router, Request } from 'express';
import asyncify from 'express-asyncify';

const router = asyncify(Router());

router.post('/login', async (req, res) => {
  try {
    const { userId, userPw } = req.body;

    if (userId !== 'admin') {
      throw new CustomError('NOT_MATCH_ID', '아이디가 일치하지 않습니다');
    }
    if (userPw !== '123qwe') {
      throw new CustomError('NOT_MATCH_PW', '비밀번호가 일치하지 않습니다');
    }

    res.json();
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
