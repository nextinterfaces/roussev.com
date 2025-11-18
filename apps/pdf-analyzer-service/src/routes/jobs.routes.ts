import { Router } from 'express';
import multer from 'multer';
import { paths } from '../config/index.js';
import { upload, listJobs, getJob, completeJob } from '../controllers/jobs.controller.js';

const router = Router();

const uploadMw = multer({ dest: paths.tmpUploadDir });

router.post('/v1/uploads', uploadMw.single('file'), upload);
router.get('/v1/jobs', listJobs);
router.get('/v1/jobs/:id', getJob);
router.post('/v1/jobs/:id/complete', completeJob);

export default router;
