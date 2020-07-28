const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'ejs');

// Global Middlewares

// Cookie parser
app.use(cookieParser());

// Security HTTP headers
app.use(helmet());

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please retry in an hour',
});
app.use(`/api`, limiter);

// Body parser – reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data santization against XSS
app.use(xss());

const corsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
};

// Use cors
app.use(cors(corsOptions));

// Compress text sent to client
app.use(compression());

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
