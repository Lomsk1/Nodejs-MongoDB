import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appErrors.js';
import { errorController } from './controllers/errorController.js';
import dotenv from 'dotenv';

dotenv.config();

// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');

const app = express();
// console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  // 3-rd Party Middleware
  app.use(morgan('dev'));
  console.log('sd')
}

// Middleware
app.use(express.json());

// Static Files Read
app.use(express.static(`./public`));

// Own Middleware
app.use((req, res, next) => {
  next(); // If we don't use next() function, we don't receive responses
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this`));
});

app.use(errorController);

export default app;