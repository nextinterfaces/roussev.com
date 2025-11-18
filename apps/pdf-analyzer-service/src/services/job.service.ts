import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir } from '../utils/fs.js';
import { paths } from '../config/index.js';
import { Job, JobStatus } from '../types/job.js';

class JobService {
  private jobs = new Map<string, Job>();

  constructor() {
    ensureDir(paths.uploadsDir);
  }

  createJobFromUpload(tempPath: string, originalName: string): string {
    const id = uuidv4().replace(/-/g, '');
    const ext = path.extname(originalName) || '.pdf';
    const finalPath = path.join(paths.uploadsDir, `${id}${ext}`);
    fs.renameSync(tempPath, finalPath);
    const now = new Date().toISOString();
    const job: Job = {
      id,
      status: 'queued',
      filePath: finalPath,
      originalName,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(id, job);
    return id;
  }

  listJobs() {
    return Array.from(this.jobs.values()).map((j) => ({
      id: j.id,
      status: j.status,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
    }));
  }

  getJob(id: string) {
    return this.jobs.get(id);
  }

  completeJob(id: string, status: JobStatus, result?: any, error?: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.status = status;
    job.result = result;
    job.error = error;
    job.updatedAt = new Date().toISOString();
    this.jobs.set(job.id, job);
    return true;
  }
}

export const jobService = new JobService();
