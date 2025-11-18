import { Request, Response } from 'express';
import { jobService } from '../services/job.service.js';

export const upload = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'file is required' });
    return;
  }
  
  try {
    const id = await jobService.createJobFromUpload(req.file.path, req.file.originalname);
    res.status(201).json({ jobId: id });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const listJobs = (_req: Request, res: Response) => {
  res.json({ jobs: jobService.listJobs() });
};

export const getJob = (req: Request, res: Response) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(job);
};

export const completeJob = (req: Request, res: Response) => {
  const status = req.body?.status === 'failed' ? 'failed' : 'completed';
  const ok = jobService.completeJob(req.params.id, status, req.body?.result, req.body?.error);
  if (!ok) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json({ ok: true });
};
