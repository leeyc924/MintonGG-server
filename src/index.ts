import express from 'express';
import cors from 'cors';
import compression from 'compression';
import router from './router';
import dayjs from 'dayjs';

const port = process.env.PORT || 8005;

function main() {
  const app = express();
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', router);
  app.use('/*', function (req, res) {
    res.status(500).json({ message: 'Invalid Path' });
  });
  app.listen(port, () => {
    console.log('Express is listening on port', port);
  });
}

main();
