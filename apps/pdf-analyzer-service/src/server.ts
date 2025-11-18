import app from './app.js';
import { config, paths } from './config/index.js';
import { ensureDir } from './utils/fs.js';

ensureDir(paths.uploadsDir);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`pdf-analyzer-service listening on port ${config.port}`);
});
