import { CustomError } from '@utils';
import { Router, Request } from 'express';
import jwt from 'jsonwebtoken';
import asyncify from 'express-asyncify';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  let auth = 'USER';
  switch (id) {
    case 'admin': {
      if (password !== 'ad#2024') {
        throw new CustomError('PASSWORD', 500, '비밀번호가 일치하지 않습니다');
      }
      auth = 'ADMIN';
      break;
    }
    case 'manager': {
      if (password !== '2024mg!') {
        throw new CustomError('PASSWORD', 500, '비밀번호가 일치하지 않습니다');
      }
      auth = 'MANAGER';
      break;
    }
    case 'user': {
      if (password !== 'user2024@') {
        throw new CustomError('PASSWORD', 500, '비밀번호가 일치하지 않습니다');
      }
      auth = 'USER';
      break;
    }
    default: {
      throw new CustomError('INVALID', 500, '아이디가 존재하지 않습니다');
    }
  }

  const payload = {
    auth,
  };

  const token = await new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '365d' }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });

  res.cookie('accessToken', token, { expires: dayjs().add(365, 'day').toDate(), secure: true });
  res.json({ accessToken: token });
});

router.post('/check', async (req, res) => {
  try {
    const accessToken = req.cookies['accessToken'];
    console.log(req.cookies);
    const decodedData = await new Promise((resolve, reject) => {
      jwt.verify(accessToken as string, process.env.JWT_SECRET || '', (err, decodedData) => {
        if (err) {
          console.log('jwt err', err);
          reject(err);
        }

        resolve(decodedData);
      });
    });

    res.json(decodedData);
  } catch (error) {
    throw CustomError.authError((error as Error).message);
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.json({ resultFlag: true });
  } catch (error) {
    throw CustomError.authError((error as Error).message);
  }
});

export default router;
