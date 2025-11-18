import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir } from '../utils/fs.js';
import { paths } from '../config/index.js';
import { Job, JobStatus } from '../types/job.js';
import { queueService } from './queue.service.js';
import { logger } from '../utils/logger.js';

class JobService {
  private jobs = new Map<string, Job>();

  constructor() {
    ensureDir(paths.uploadsDir);
  }

  async createJobFromUpload(filePath: string, originalName: string): Promise<string> {
    // Extract ID from the filename (multer has already named it with UUID + extension)
    const id = path.basename(filePath, path.extname(filePath));
    const now = new Date().toISOString();
    const job: Job = {
      id,
      status: 'queued',
      filePath,
      originalName,
      createdAt: now,
      updatedAt: now,
    };
    
    this.jobs.set(id, job);
    
    try {
      // Add the job to the queue
      await queueService.addJob(id);
      logger.info(`Job ${id} added to the queue for file: ${originalName}`);
      return id;
    } catch (error) {
      logger.error(`Failed to add job ${id} to queue:`, error);
      // Clean up the job if queue addition fails
      this.jobs.delete(id);
      throw new Error('Failed to add job to queue');
    }
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
    
    logger.info(`Job ${id} marked as ${status}`, { result, error });
    return true;
  }
}

export const jobService = new JobService();
