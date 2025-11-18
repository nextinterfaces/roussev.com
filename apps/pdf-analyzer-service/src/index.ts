import express from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import os from 'os';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const commitSha = process.env.COMMIT_SHA || 'local-dev';
const storageRoot = process.env.STORAGE_DIR || path.join(process.cwd(), 'data');
const uploadsDir = path.join(storageRoot, 'uploads');

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type Job = {
    id: string;
    status: JobStatus;
    filePath: string;
    originalName: string;
    createdAt: string;
    updatedAt: string;
    error?: string;
    result?: any;
};
const jobs = new Map<string, Job>();

app.use(express.json());

app.get('/v1/health', (_req, res) => {
    res.json({status: 'ok', commit: commitSha});
});

function ensureDir(p: string) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, {recursive: true});
    }
}

ensureDir(uploadsDir);

const upload = multer({dest: path.join(os.tmpdir(), 'pdf-analyzer-uploads')});

app.post('/v1/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({error: 'file is required'});
        return;
    }
    const id = uuidv4().replace(/-/g, '');
    const ext = path.extname(req.file.originalname) || '.pdf';
    const finalPath = path.join(uploadsDir, `${id}${ext}`);
    fs.renameSync(req.file.path, finalPath);
    const now = new Date().toISOString();
    const job: Job = {
        id,
        status: 'queued',
        filePath: finalPath,
        originalName: req.file.originalname,
        createdAt: now,
        updatedAt: now,
    };
    jobs.set(id, job);
    res.status(201).json({jobId: id});
});

app.get('/v1/jobs', (_req, res) => {
    const list = Array.from(jobs.values()).map(j => ({
        id: j.id,
        status: j.status,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
    }));
    res.json({jobs: list});
});

app.get('/v1/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
        res.status(404).json({error: 'not found'});
        return;
    }
    res.json(job);
});

app.post('/v1/jobs/:id/complete', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
        res.status(404).json({error: 'not found'});
        return;
    }
    const status: JobStatus = req.body?.status === 'failed' ? 'failed' : 'completed';
    job.status = status;
    job.result = req.body?.result;
    job.error = req.body?.error;
    job.updatedAt = new Date().toISOString();
    jobs.set(job.id, job);
    res.json({ok: true});
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
