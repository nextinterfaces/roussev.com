import path from 'path';
import os from 'os';

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  commitSha: process.env.COMMIT_SHA || 'local-dev',
  storageRoot: process.env.STORAGE_DIR || path.join(process.cwd(), 'data'),
};

export const paths = {
  uploadsDir: path.join(config.storageRoot, 'uploads'),
  tmpUploadDir: path.join(os.tmpdir(), 'pdf-analyzer-uploads'),
  openapiPath: path.join(process.cwd(), 'api', 'openapi.yaml'),
};
