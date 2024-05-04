import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import router from './router';
import { CustomError } from './utils/error';

function main() {
  const port = process.env.PORT;
  const app = express();
  app.use(cors({ origin: process.env.FE_URL, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', router);
  app.use('/*', (req, res, next) => {
    throw CustomError.notFoundError();
  });
  app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
    console.log(error);
    res.status(status).json({ message: error.message });
  });

  app.listen(port, () => {
    console.log('Express is listening on port', port);
  });
}

try {
  main();
} catch (error) {
  console.log(error);
}
