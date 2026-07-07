import * as fs from 'fs';
import * as path from 'path';

function printUsage() {
  console.log('Usage: npx tsx scripts/validate-submissions.ts <path-to-json-file>');
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    printUsage();
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  let content: string;
  try {
    content = fs.readFileSync(absolutePath, 'utf-8');
  } catch (e) {
    console.error(`Error: Failed to read file at ${absolutePath}: ${(e as Error).message}`);
    process.exit(1);
  }

  let data: any;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`Error: File is not valid JSON. ${(e as Error).message}`);
    process.exit(1);
  }

  if (typeof data !== 'object' || data === null) {
    console.error('Error: Root of JSON must be an object.');
    process.exit(1);
  }

  const benchmark = data.benchmark;
  if (typeof benchmark !== 'string') {
    console.error('Error: "benchmark" field is missing or not a string.');
    process.exit(1);
  }

  const isGsb = benchmark === 'GSB' || benchmark === 'Gaia Skill Bench';
  const schemaPath = isGsb
    ? path.resolve(__dirname, '../content/schemas/gsb-submission.schema.json')
    : path.resolve(__dirname, '../content/schemas/benchmark-result.schema.json');

  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found at ${schemaPath}. Please run scripts/generate-templates.ts first.`);
    process.exit(1);
  }

  console.log(`Validating submission against: ${path.basename(schemaPath)}`);
  const errors: string[] = [];

  if (isGsb) {
    validateGsb(data, errors);
  } else {
    validateGeneralBenchmark(data, errors);
  }

  if (errors.length > 0) {
    console.error('\nValidation FAILED:');
    errors.forEach((err, index) => {
      console.error(`  ${index + 1}. ${err}`);
    });
    process.exit(1);
  } else {
    console.log('\nValidation SUCCESSFUL! The submission matches the schema.');
    process.exit(0);
  }
}

function validateGsb(data: any, errors: string[]) {
  // Required root properties
  const required = ['benchmark', 'version', 'pillars', 'runManifest'];
  for (const field of required) {
    if (!(field in data)) {
      errors.push(`Missing required root field: "${field}"`);
    }
  }

  if (data.version && !['1.0', '1', 'v1'].includes(data.version)) {
    errors.push(`Invalid version: "${data.version}". Expected "1.0", "1", or "v1".`);
  }

  if (data.model) {
    if (typeof data.model !== 'object' || data.model === null) {
      errors.push('Field "model" must be an object.');
    } else {
      if (typeof data.model.name !== 'string' || !data.model.name.trim()) {
        errors.push('Field "model.name" must be a non-empty string.');
      }
      if (data.model.creator !== undefined && typeof data.model.creator !== 'string') {
        errors.push('Field "model.creator" must be a string.');
      }
    }
  }

  if (data.pillars) {
    if (typeof data.pillars !== 'object' || data.pillars === null) {
      errors.push('Field "pillars" must be an object.');
    } else {
      const pillarConfigs = [
        { name: 'performance', weight: 0.40 },
        { name: 'reliability', weight: 0.30 },
        { name: 'triggering', weight: 0.20 },
        { name: 'efficiency', weight: 0.10 }
      ];

      for (const pillar of pillarConfigs) {
        const value = data.pillars[pillar.name];
        if (!value) {
          errors.push(`Missing pillar: "pillars.${pillar.name}"`);
        } else if (typeof value !== 'object' || value === null) {
          errors.push(`Field "pillars.${pillar.name}" must be an object.`);
        } else {
          if (typeof value.score !== 'number' || value.score < 0 || value.score > 100) {
            errors.push(`Field "pillars.${pillar.name}.score" must be a number between 0 and 100.`);
          }
          if (value.weight !== pillar.weight) {
            errors.push(`Field "pillars.${pillar.name}.weight" must be exactly ${pillar.weight}.`);
          }
        }
      }

      if (data.pillars.overallScore !== undefined) {
        if (typeof data.pillars.overallScore !== 'number') {
          errors.push('Field "pillars.overallScore" must be a number.');
        } else {
          // Calculate expected weighted average
          const perf = data.pillars.performance?.score ?? 0;
          const rel = data.pillars.reliability?.score ?? 0;
          const trig = data.pillars.triggering?.score ?? 0;
          const eff = data.pillars.efficiency?.score ?? 0;
          const expectedOverall = perf * 0.40 + rel * 0.30 + trig * 0.20 + eff * 0.10;
          if (Math.abs(data.pillars.overallScore - expectedOverall) > 0.01) {
            errors.push(`Weighted overallScore check failed. Calculated: ${expectedOverall.toFixed(2)}, Provided: ${data.pillars.overallScore}`);
          }
        }
      }
    }
  }

  if (data.runManifest) {
    if (typeof data.runManifest !== 'object' || data.runManifest === null) {
      errors.push('Field "runManifest" must be an object.');
    } else {
      const manifestFields = [
        { name: 'seeds', type: 'array' },
        { name: 'modelRevision', type: 'string' },
        { name: 'containerSha', type: 'string', pattern: /^sha256:[a-f0-9]{64}$/ },
        { name: 'envHash', type: 'string' },
        { name: 'rawScores', type: 'object' },
        { name: 'signature', type: 'string' }
      ];

      for (const field of manifestFields) {
        const value = data.runManifest[field.name];
        if (value === undefined) {
          errors.push(`Missing runManifest field: "runManifest.${field.name}"`);
          continue;
        }

        if (field.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`Field "runManifest.${field.name}" must be an array.`);
          } else if (field.name === 'seeds') {
            for (let i = 0; i < value.length; i++) {
              if (!Number.isInteger(value[i])) {
                errors.push(`Field "runManifest.seeds[${i}]" must be an integer.`);
              }
            }
          }
        } else if (field.type === 'object') {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            errors.push(`Field "runManifest.${field.name}" must be an object.`);
          } else if (field.name === 'rawScores') {
            for (const key of Object.keys(value)) {
              if (typeof value[key] !== 'number') {
                errors.push(`Raw score for "${key}" in "runManifest.rawScores" must be a number.`);
              }
            }
          }
        } else {
          if (typeof value !== 'string') {
            errors.push(`Field "runManifest.${field.name}" must be a string.`);
          } else if (field.pattern && !field.pattern.test(value)) {
            errors.push(`Field "runManifest.${field.name}" must match format (e.g., sha256:hex-string).`);
          }
        }
      }
    }
  }
}

function validateGeneralBenchmark(data: any, errors: string[]) {
  // Required root properties
  const required = ['benchmark', 'version', 'model', 'metrics', 'reproducibleManifest'];
  for (const field of required) {
    if (!(field in data)) {
      errors.push(`Missing required root field: "${field}"`);
    }
  }

  if (data.model) {
    if (typeof data.model !== 'object' || data.model === null) {
      errors.push('Field "model" must be an object.');
    } else {
      if (typeof data.model.name !== 'string' || !data.model.name.trim()) {
        errors.push('Field "model.name" must be a non-empty string.');
      }
      if (data.model.revision !== undefined && typeof data.model.revision !== 'string') {
        errors.push('Field "model.revision" must be a string.');
      }
      if (data.model.provider !== undefined && typeof data.model.provider !== 'string') {
        errors.push('Field "model.provider" must be a string.');
      }
    }
  }

  if (data.metrics) {
    if (typeof data.metrics !== 'object' || data.metrics === null) {
      errors.push('Field "metrics" must be an object.');
    } else {
      if (!data.metrics.primary) {
        errors.push('Missing primary metric in "metrics.primary"');
      } else if (typeof data.metrics.primary !== 'object' || data.metrics.primary === null) {
        errors.push('Field "metrics.primary" must be an object.');
      } else {
        if (typeof data.metrics.primary.name !== 'string' || !data.metrics.primary.name.trim()) {
          errors.push('Field "metrics.primary.name" must be a non-empty string.');
        }
        if (typeof data.metrics.primary.value !== 'number') {
          errors.push('Field "metrics.primary.value" must be a number.');
        }
      }

      // Check other properties in metrics
      for (const key of Object.keys(data.metrics)) {
        if (key !== 'primary' && typeof data.metrics[key] !== 'number') {
          errors.push(`Metric field "metrics.${key}" must be a number.`);
        }
      }
    }
  }

  if (data.reproducibleManifest) {
    if (typeof data.reproducibleManifest !== 'object' || data.reproducibleManifest === null) {
      errors.push('Field "reproducibleManifest" must be an object.');
    } else {
      const manifestFields = [
        { name: 'seeds', type: 'array', required: false },
        { name: 'containerSha', type: 'string', required: true, pattern: /^sha256:[a-f0-9]{64}$/ },
        { name: 'envHash', type: 'string', required: true },
        { name: 'signature', type: 'string', required: false }
      ];

      for (const field of manifestFields) {
        const value = data.reproducibleManifest[field.name];
        if (value === undefined) {
          if (field.required) {
            errors.push(`Missing reproducibleManifest field: "reproducibleManifest.${field.name}"`);
          }
          continue;
        }

        if (field.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`Field "reproducibleManifest.${field.name}" must be an array.`);
          } else if (field.name === 'seeds') {
            for (let i = 0; i < value.length; i++) {
              if (!Number.isInteger(value[i])) {
                errors.push(`Field "reproducibleManifest.seeds[${i}]" must be an integer.`);
              }
            }
          }
        } else {
          if (typeof value !== 'string') {
            errors.push(`Field "reproducibleManifest.${field.name}" must be a string.`);
          } else if (field.pattern && !field.pattern.test(value)) {
            errors.push(`Field "reproducibleManifest.${field.name}" must match SHA256 format (sha256:64-hex-chars).`);
          }
        }
      }
    }
  }
}

main();
