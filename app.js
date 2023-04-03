import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import AppError from './utils/appErrors.js';
import { errorController } from './controllers/errorController.js';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

dotenv.config();

// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');

const app = express();

// For static files
app.set('view engine', 'pug');
app.set('views', './views');

// Static Files Read
app.use(express.static(`./public`));

// SET Security HTTP headers
app.use(helmet());

// 1) Development Logging
if (process.env.NODE_ENV === 'development') {
  // 3-rd Party Middleware
  app.use(morgan('dev'));
}

// fot how many request per IP we are going to  allowed in a certain amount of time
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //for hour
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter); //only which starts with this URL

// Middleware
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration'], // if we need to get double or more sorts
  })
);

// Own Middleware
app.use((req, res, next) => {
  next(); // If we don't use next() function, we don't receive responses
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.get('/', (req, res) => {
  res.status(200).render('base');
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

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
