import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

const YAML_CONFIG_FILENAME = process.env['NODE_ENV'] || 'development';

export default () => {
  return yaml.load(readFileSync(join(__dirname, `${YAML_CONFIG_FILENAME}.yml`), 'utf8')) as Record<string, unknown>;
};
