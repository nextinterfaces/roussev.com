import { Queue, Worker, Job } from 'bullmq';
import { Job as JobType } from '../types/job.js';
import { jobService } from './job.service.js';
import { logger } from '../utils/logger.js';

const QUEUE_NAME = 'pdf-analyzer-queue';

class QueueService {
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        const { jobId } = job.data;
        const jobData = jobService.getJob(jobId);
        
        if (!jobData) {
          throw new Error(`Job ${jobId} not found`);
        }

        // Here you would typically process the PDF file
        // For now, we'll just simulate some work
        logger.info(`Processing job ${jobId} for file: ${jobData.originalName}`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate work
        
        return { success: true, jobId };
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.worker.on('completed', async (job: Job, result: any) => {
      logger.info(`Job ${job.id} completed with result:`, result);
      jobService.completeJob(job.data.jobId, 'completed', result);
    });

    this.worker.on('failed', (job: any, error: Error) => {
      logger.error(`Job ${job?.id} failed with error:`, error);
      if (job) {
        jobService.completeJob(job.data.jobId, 'failed', null, error.message);
      }
    });
  }

  async addJob(jobId: string) {
    await this.queue.add('process-pdf', { jobId });
  }

  async close() {
    await this.worker.close();
    await this.queue.close();
  }
}

export const queueService = new QueueService();
