import { Router } from 'express';
import { listFiles, deleteAllFiles } from '../controllers/files.controller.js';

const router = Router();

router.get('/v1/files', listFiles);
router.delete('/v1/files', deleteAllFiles);

export default router;
