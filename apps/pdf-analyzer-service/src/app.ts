import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { loadOpenApi } from './utils/swagger.js';

const app = express();

app.use(express.json());

const openapiDoc = loadOpenApi();
app.get('/docs', (_req, res) => {
  res.send(swaggerUi.generateHTML(openapiDoc));
});
app.use('/docs', swaggerUi.serveFiles(openapiDoc));
app.get('/', (_req, res) => res.redirect('/docs'));

registerRoutes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
