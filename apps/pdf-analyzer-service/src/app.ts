import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { loadOpenApi } from './utils/swagger.js';

const app = express();

app.use(express.json());

const openapiDoc = loadOpenApi();
// Normalize '/docs' to '/docs/' to prevent absolute redirect that would drop ingress prefix
app.use((req, _res, next) => {
  if (req.path === '/docs') {
    req.url = '/docs/';
  }
  next();
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

registerRoutes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
