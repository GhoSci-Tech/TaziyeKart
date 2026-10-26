import express from 'express';
import cookieParser from 'cookie-parser';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { errorHandler, notFoundHandler } from './lib/errors';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
