export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  filePath: string;
  originalName: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
  result?: any;
}
