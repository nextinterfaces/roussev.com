import { Request, Response } from 'express';
import { config } from '../config/index.js';

export const health = (_req: Request, res: Response) => {
  res.json({ status: 'ok', commit: config.commitSha });
};
