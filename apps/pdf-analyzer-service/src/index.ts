import express from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const commitSha = process.env.COMMIT_SHA || 'local-dev';

app.use(express.json());

app.get('/v1/health', (_req, res) => {
  res.json({ status: 'ok', commit: commitSha });
});

// Load OpenAPI spec
const openapiPath = path.join(process.cwd(), 'api', 'openapi.yaml');
let openapiDoc: any = {};
try {
  const file = fs.readFileSync(openapiPath, 'utf8');
  openapiDoc = yaml.load(file);
} catch (e) {
  console.error('Failed to load OpenAPI spec:', e);
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.get('/', (_req, res) => {
  res.redirect('/docs');
});

app.listen(port, () => {
  console.log(`pdf-analyzer-service listening on port ${port}`);
});
