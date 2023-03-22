import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB success'))
  .catch((e) => console.log(e));

const port = process.env.PORT || 3000;
// const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
