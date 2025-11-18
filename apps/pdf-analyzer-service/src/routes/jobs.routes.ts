import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { paths } from '../config/index.js';
import { upload, listJobs, getJob, completeJob } from '../controllers/jobs.controller.js';

const router = Router();

const uploadMw = multer({
  storage: multer.diskStorage({
    destination: paths.uploadsDir,
    filename: (_req, file, cb) => {
      const id = uuidv4().replace(/-/g, '');
      const ext = path.extname(file.originalname) || '.pdf';
      cb(null, `${id}${ext}`);
    },
  }),
});

router.post('/v1/uploads', uploadMw.single('file'), upload);
router.get('/v1/jobs', listJobs);
router.get('/v1/jobs/:id', getJob);
router.post('/v1/jobs/:id/complete', completeJob);

export default router;
