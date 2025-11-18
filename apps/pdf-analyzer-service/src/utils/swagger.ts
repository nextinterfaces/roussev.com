import fs from 'fs';
import yaml from 'js-yaml';
import { paths } from '../config/index.js';

export function loadOpenApi(): any {
  try {
    const file = fs.readFileSync(paths.openapiPath, 'utf8');
    return yaml.load(file);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load OpenAPI spec:', e);
    return {};
  }
}
