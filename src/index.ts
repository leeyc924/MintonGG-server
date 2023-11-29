import express from 'express';
import cors from 'cors';
import compression from 'compression';
import router from './router';

function main() {
  const port = process.env.PORT;
  const app = express();
  console.log(process.env.DB_HOST);
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

try {
  main();
} catch (error) {
  console.log(error);
}
