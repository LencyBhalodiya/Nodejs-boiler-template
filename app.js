import express from 'express';
import { morganLogger } from './config/logger.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { errorHandler, limiter } from './middleware/index.js';
import routes from './routes/index.js';

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '16kb' }));

// sanitize request data
app.use(mongoSanitize());

// enable cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// set logger for nodejs
app.use(morganLogger);

// rate limit api calls
app.use(limiter);

// v1 api routes
app.use('/v1', routes);

// global error handler
app.use(errorHandler);

export default app;
