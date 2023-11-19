import { Router, Request } from 'express';
import asyncify from 'express-asyncify';

const router = asyncify(Router());
class CustomError extends Error {
  errorCode: string;

  constructor(errorCode: string, message: string) {
    console.log(message);
    super(message);
    this.errorCode = errorCode;
  }
}

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
    if (error instanceof CustomError) {
      res.status(403).json(error);
    }

    res.status(400).json(error);
  }
});

export default router;
