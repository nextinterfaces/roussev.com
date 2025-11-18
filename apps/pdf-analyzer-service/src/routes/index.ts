import { Express } from 'express';
import healthRouter from './health.routes.js';
import jobsRouter from './jobs.routes.js';
import filesRouter from './files.routes.js';

export function registerRoutes(app: Express) {
  app.use(healthRouter);
  app.use(jobsRouter);
  app.use(filesRouter);
}
