import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { paths } from '../config/index.js';

export const listFiles = (_req: Request, res: Response) => {
  if (!fs.existsSync(paths.uploadsDir)) {
    res.json({ files: [] });
    return;
  }
  const names = fs.readdirSync(paths.uploadsDir);
  const files = names.map((name) => {
    const full = path.join(paths.uploadsDir, name);
    const st = fs.statSync(full);
    return { name, size: st.size, mtime: st.mtime.toISOString() };
  });
  res.json({ files });
};

export const deleteAllFiles = (_req: Request, res: Response) => {
  if (!fs.existsSync(paths.uploadsDir)) {
    res.json({ deleted: 0 });
    return;
  }
  const names = fs.readdirSync(paths.uploadsDir);
  let deleted = 0;
  for (const name of names) {
    const full = path.join(paths.uploadsDir, name);
    try {
      fs.unlinkSync(full);
      deleted += 1;
    } catch (_) {
      // ignore
    }
  }
  res.json({ deleted });
};
