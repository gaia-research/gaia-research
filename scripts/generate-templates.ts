import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync } from 'child_process';

const ADJACENT_REPO_PATH = path.resolve(__dirname, '../../gaia-skill-tree');
const REMOTE_SCHEMA_URL = 'https://raw.githubusercontent.com/gaia-research/gaia-skill-tree/dev/sprint-d-benchmark-leaderboard/registry/schema/evidence/benchmark-result.schema.json';

const SCHEMA_OUTPUT_DIR = path.resolve(__dirname, '../content/schemas');
const TEMPLATE_OUTPUT_DIR = path.resolve(__dirname, '../content/templates');

const BENCHMARK_SCHEMA_PATH = path.join(SCHEMA_OUTPUT_DIR, 'benchmark-result.schema.json');
const GSB_SCHEMA_PATH = path.join(SCHEMA_OUTPUT_DIR, 'gsb-submission.schema.json');

const GSB_TEMPLATE_PATH = path.join(TEMPLATE_OUTPUT_DIR, 'gsb-submission.json');
const BENCHMARK_TEMPLATE_PATH = path.join(TEMPLATE_OUTPUT_DIR, 'benchmark-submission.json');

// High-quality fallback schema for benchmark-result.schema.json
const FALLBACK_BENCHMARK_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://gaia-registry.github.io/schema/benchmark-result.schema.json",
  "title": "General Benchmark Result Submission",
  "description": "Standard schema for registering general agent benchmark result submissions on the Gaia Skill Tree platform.",
  "type": "object",
  "required": [
    "benchmark",
    "version",
    "model",
    "metrics",
    "reproducibleManifest"
  ],
  "additionalProperties": false,
  "properties": {
    "benchmark": {
      "type": "string",
      "description": "Name of the benchmark suite (e.g. GAIA, SWE-bench, HumanEval, WebArena)."
    },
    "version": {
      "type": "string",
      "description": "Version of the benchmark suite or configuration used."
    },
    "model": {
      "type": "object",
      "required": [
        "name"
      ],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string",
          "description": "Name or identifier of the evaluated model."
        },
        "revision": {
          "type": "string",
          "description": "Commit SHA or version descriptor of the model weights/parameters."
        },
        "provider": {
          "type": "string",
          "description": "The provider/creator of the model (e.g., OpenAI, Anthropic, Meta)."
        }
      }
    },
    "metrics": {
      "type": "object",
      "required": [
        "primary"
      ],
      "additionalProperties": true,
      "properties": {
        "primary": {
          "type": "object",
          "required": [
            "name",
            "value"
          ],
          "additionalProperties": false,
          "properties": {
            "name": {
              "type": "string",
              "description": "Name of the primary metric (e.g. accuracy, pass@1)."
            },
            "value": {
              "type": "number",
              "description": "The value of the primary metric."
            }
          }
        }
      }
    },
    "reproducibleManifest": {
      "type": "object",
      "required": [
        "containerSha",
        "envHash"
      ],
      "additionalProperties": false,
      "properties": {
        "seeds": {
          "type": "array",
          "items": {
            "type": "integer"
          },
          "description": "List of random seeds used for the runs."
        },
        "containerSha": {
          "type": "string",
          "pattern": "^sha256:[a-f0-9]{64}$",
          "description": "Docker container or OCI image SHA."
        },
        "envHash": {
          "type": "string",
          "description": "Cryptographic hash of the environment specification (e.g. lockfile SHA)."
        },
        "signature": {
          "type": "string",
          "description": "Cryptographic signature verifying authenticity."
        }
      }
    }
  }
};

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: Status Code ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function tryGitShow(): string | null {
  try {
    if (fs.existsSync(ADJACENT_REPO_PATH)) {
      console.log(`Attempting git show from adjacent repository at: ${ADJACENT_REPO_PATH}`);
      const stdout = execSync(
        `git -C "${ADJACENT_REPO_PATH}" show dev/sprint-d-benchmark-leaderboard:registry/schema/evidence/benchmark-result.schema.json`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      if (stdout && stdout.trim()) {
        console.log('Successfully retrieved schema via git show!');
        return stdout.trim();
      }
    }
  } catch (e) {
    console.warn('Git show attempt failed (branch or file not found locally).');
  }
  return null;
}

async function getBenchmarkSchema(): Promise<any> {
  // 1. Try local git show first
  const gitSchemaContent = tryGitShow();
  if (gitSchemaContent) {
    try {
      return JSON.parse(gitSchemaContent);
    } catch (e) {
      console.error('Failed to parse schema retrieved via git show, falling back...');
    }
  }

  // 2. Try raw GitHub URL fallback
  console.log(`Attempting remote fetch from: ${REMOTE_SCHEMA_URL}`);
  try {
    const remoteSchemaContent = await fetchUrl(REMOTE_SCHEMA_URL);
    if (remoteSchemaContent && remoteSchemaContent.trim()) {
      console.log('Successfully retrieved schema from raw GitHub URL!');
      return JSON.parse(remoteSchemaContent);
    }
  } catch (e) {
    console.warn(`Remote fetch failed: ${(e as Error).message}`);
  }

  // 3. Fallback to hardcoded schema
  console.log('Using fallback benchmark-result schema.');
  return FALLBACK_BENCHMARK_SCHEMA;
}

async function main() {
  try {
    // Ensure output directories exist
    if (!fs.existsSync(SCHEMA_OUTPUT_DIR)) {
      fs.mkdirSync(SCHEMA_OUTPUT_DIR, { recursive: true });
    }
    if (!fs.existsSync(TEMPLATE_OUTPUT_DIR)) {
      fs.mkdirSync(TEMPLATE_OUTPUT_DIR, { recursive: true });
    }

    // 1. Retrieve benchmark result schema
    const benchmarkSchema = await getBenchmarkSchema();
    fs.writeFileSync(BENCHMARK_SCHEMA_PATH, JSON.stringify(benchmarkSchema, null, 2), 'utf-8');
    console.log(`Saved benchmark-result.schema.json to ${BENCHMARK_SCHEMA_PATH}`);

    // 2. Generate gsb-submission.json template
    const gsbTemplate = {
      "benchmark": "Gaia Skill Bench",
      "version": "1.0",
      "model": {
        "name": "Gaia-Agent-v1",
        "creator": "Gaia Research"
      },
      "pillars": {
        "performance": {
          "score": 85.0,
          "weight": 0.4
        },
        "reliability": {
          "score": 90.0,
          "weight": 0.3
        },
        "triggering": {
          "score": 75.0,
          "weight": 0.2
        },
        "efficiency": {
          "score": 95.0,
          "weight": 0.1
        },
        "overallScore": 85.5
      },
      "runManifest": {
        "seeds": [42, 1337, 9000],
        "modelRevision": "git:8fa3b2c",
        "containerSha": "sha256:d554a9382103f6fdf3e2b2f6efd4206e053f3e2b10166e40938f3210166e4f3a",
        "envHash": "sha256:1f1a5b8a5d3f2a1b9c8d7e6f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
        "rawScores": {
          "task_001": 1.0,
          "task_002": 0.0,
          "task_003": 1.0
        },
        "signature": "sig:ed25519:abcdef1234567890abcdef1234567890"
      }
    };
    fs.writeFileSync(GSB_TEMPLATE_PATH, JSON.stringify(gsbTemplate, null, 2), 'utf-8');
    console.log(`Generated template: ${GSB_TEMPLATE_PATH}`);

    // 3. Generate benchmark-submission.json template
    const benchmarkTemplate = {
      "benchmark": "GAIA",
      "version": "1.0.1",
      "model": {
        "name": "Gaia-Agent-v1",
        "revision": "git:8fa3b2c",
        "provider": "Gaia Research"
      },
      "metrics": {
        "primary": {
          "name": "accuracy",
          "value": 42.5
        },
        "level_1_accuracy": 68.2,
        "level_2_accuracy": 40.1,
        "level_3_accuracy": 19.2
      },
      "reproducibleManifest": {
        "seeds": [42],
        "containerSha": "sha256:d554a9382103f6fdf3e2b2f6efd4206e053f3e2b10166e40938f3210166e4f3a",
        "envHash": "sha256:1f1a5b8a5d3f2a1b9c8d7e6f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
        "signature": "sig:ed25519:abcdef1234567890abcdef1234567890"
      }
    };
    fs.writeFileSync(BENCHMARK_TEMPLATE_PATH, JSON.stringify(benchmarkTemplate, null, 2), 'utf-8');
    console.log(`Generated template: ${BENCHMARK_TEMPLATE_PATH}`);

  } catch (error) {
    console.error('Error generating templates/schemas:', error);
    process.exit(1);
  }
}

main();
