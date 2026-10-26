import express from 'express';
import cookieParser from 'cookie-parser';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { panelRouter } from './routes/panel';
import { publicRouter } from './routes/public';
import { editRouter } from './routes/edit';
import { errorHandler, notFoundHandler } from './lib/errors';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/panel', panelRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/edit', editRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
