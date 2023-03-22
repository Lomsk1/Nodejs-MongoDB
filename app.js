import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');

const app = express();
// console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  // 3-rd Party Middleware
  app.use(morgan('dev'));
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

export default app;
