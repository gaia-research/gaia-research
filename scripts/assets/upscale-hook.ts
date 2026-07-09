import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { parseArgs, requireOption } from './lib/args';
import { getFileMetadata } from './lib/hash';
import { getImageInfo } from './lib/image';
import { loadLedger, saveLedger, AssetEntry } from './lib/ledger';
import { resolveRepoPath, getRelativePath, ensureDirExists } from './lib/paths';

// Real-ESRGAN Replicate model version
const REPLICATE_REAL_ESRGAN_VERSION = '42fed1c49741b585d58d912b622cdd9d28d09f3b9d5528d63cd94b85c077b5d9';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url: string, outputPath: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: status ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function runReplicateUpscale(inputPath: string, scale: number, outputPath: string): Promise<void> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('\x1b[31mError: REPLICATE_API_TOKEN environment variable is not set.\x1b[0m');
    console.error('Please set it using: export REPLICATE_API_TOKEN=your_token');
    process.exit(1);
  }

  const absInput = resolveRepoPath(inputPath);
  const inputBuffer = fs.readFileSync(absInput);
  const mimeType = inputPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const base64Image = `data:${mimeType};base64,${inputBuffer.toString('base64')}`;

  console.log(`Starting Replicate prediction using nightmare-ai/real-esrgan...`);

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: REPLICATE_REAL_ESRGAN_VERSION,
      input: {
        image: base64Image,
        scale: scale,
        face_enhance: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const prediction = (await response.json()) as any;
  const predictionId = prediction.id;
  console.log(`Prediction created (ID: ${predictionId}). Polling for result...`);

  let status = prediction.status;
  let resultUrl = '';

  while (status === 'starting' || status === 'processing') {
    await sleep(2000);
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!pollResponse.ok) {
      throw new Error(`Replicate polling API error: ${pollResponse.status}`);
    }

    const pollData = (await pollResponse.json()) as any;
    status = pollData.status;
    console.log(`Current status: ${status}...`);

    if (status === 'succeeded') {
      resultUrl = pollData.output;
      break;
    } else if (status === 'failed' || status === 'canceled') {
      throw new Error(`Replicate prediction failed or was canceled with status: ${status}`);
    }
  }

  if (!resultUrl) {
    throw new Error('No output URL found in succeeded prediction.');
  }

  console.log(`Prediction succeeded! Downloading output image...`);
  await downloadFile(resultUrl, resolveRepoPath(outputPath));
  console.log(`Saved upscaled image to: ${outputPath}`);
}

async function main() {
  const args = parseArgs();
  const force = args.flags.force || false;

  // --- ACCEPT FLOW ---
  if (args.flags.accept) {
    const candidatePath = requireOption(args.values, 'input', 'Usage for accept flow: --accept --input <candidate_output_path> --output <destination_path>');
    const destPath = requireOption(args.values, 'output', 'Usage for accept flow: --accept --input <candidate_output_path> --output <destination_path>');

    const absCandidate = resolveRepoPath(candidatePath);
    if (!fs.existsSync(absCandidate)) {
      console.error(`Candidate file not found: ${candidatePath}`);
      process.exit(1);
    }

    const absDest = resolveRepoPath(destPath);
    if (fs.existsSync(absDest) && !force) {
      console.error(`Destination file already exists: ${destPath}. Use --force to overwrite.`);
      process.exit(1);
    }

    ensureDirExists(destPath, true);
    fs.copyFileSync(absCandidate, absDest);
    console.log(`Copied accepted asset from "${candidatePath}" to "${destPath}"`);

    // Register the new accepted asset in the ledger
    const meta = getFileMetadata(destPath);
    const info = await getImageInfo(destPath);
    const baseName = path.basename(destPath, path.extname(destPath));
    const assetId = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const ledger = loadLedger();
    // Check if asset already exists in ledger
    const existingIndex = ledger.assets.findIndex(a => a.id === assetId || a.path === destPath);

    const assetEntry: AssetEntry = {
      id: existingIndex >= 0 ? ledger.assets[existingIndex].id : assetId,
      path: destPath.replace(/\\/g, '/'),
      kind: 'upscaled-image',
      status: 'approved',
      sourceType: 'derivative',
      license: 'internal-review-required',
      credit: 'Gaia Research upscaling workflow',
      alt: `Upscaled version of ${path.basename(candidatePath)}`,
      sha256: meta.sha256,
      bytes: meta.bytes,
      dimensions: info,
      derivatives: [],
    };

    if (existingIndex >= 0) {
      ledger.assets[existingIndex] = {
        ...ledger.assets[existingIndex],
        ...assetEntry,
      };
      console.log(`Updated existing ledger asset "${assetId}"`);
    } else {
      ledger.assets.push(assetEntry);
      console.log(`Added new asset "${assetId}" to ledger.`);
    }

    saveLedger(ledger);
    console.log('Accept flow completed successfully.');
    return;
  }

  // --- JOB FLOW ---
  const inputPath = requireOption(args.values, 'input', 'Usage: --input <source_file> [--scale <2|4>] [--output <out_file>] [--provider <noop|local-cli|replicate>] [--command <template_cmd>] [--dry-run]');
  const scale = args.values.scale ? parseInt(args.values.scale, 10) : 2;
  const provider = args.values.provider || 'noop';
  const dryRun = args.flags['dry-run'] || false;

  const defaultOutDir = 'assets/workbench/upscale/outputs';
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputFilePath = args.values.output || `${defaultOutDir}/${baseName}-${scale}x${path.extname(inputPath)}`;

  const absInput = resolveRepoPath(inputPath);
  if (!fs.existsSync(absInput)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const absOutput = resolveRepoPath(outputFilePath);
  if (fs.existsSync(absOutput) && !force) {
    console.error(`Output file already exists: ${outputFilePath}. Use --force to overwrite.`);
    process.exit(1);
  }

  // Write job manifest
  const jobId = `job-${Date.now()}`;
  const jobManifestPath = `assets/workbench/upscale/jobs/${jobId}.json`;
  ensureDirExists(jobManifestPath, true);

  const jobManifest = {
    id: jobId,
    input: inputPath,
    scale,
    provider,
    output: outputFilePath,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(resolveRepoPath(jobManifestPath), JSON.stringify(jobManifest, null, 2) + '\n', 'utf8');
  console.log(`Wrote job manifest to: ${jobManifestPath}`);

  if (dryRun || provider === 'noop') {
    console.log(`Dry run or provider "noop" requested. Skipping execution.`);
    return;
  }

  ensureDirExists(outputFilePath, true);

  try {
    if (provider === 'local-cli') {
      const commandTemplate = requireOption(args.values, 'command', 'Provider "local-cli" requires --command \'<cmd_template>\'');
      const cmd = commandTemplate
        .replace('{input}', absInput)
        .replace('{output}', absOutput)
        .replace('{scale}', String(scale));

      console.log(`Executing local command: ${cmd}`);
      execSync(cmd, { stdio: 'inherit' });
    } else if (provider === 'replicate') {
      await runReplicateUpscale(inputPath, scale, outputFilePath);
    } else {
      console.error(`Unknown provider: ${provider}`);
      process.exit(1);
    }

    // Verify output file and update job status
    if (fs.existsSync(absOutput)) {
      jobManifest.status = 'completed';
      fs.writeFileSync(resolveRepoPath(jobManifestPath), JSON.stringify(jobManifest, null, 2) + '\n', 'utf8');
      console.log(`Job completed successfully. Output file: ${outputFilePath}`);
    } else {
      throw new Error(`Output file was not generated by provider: ${outputFilePath}`);
    }
  } catch (err: any) {
    jobManifest.status = 'failed';
    fs.writeFileSync(resolveRepoPath(jobManifestPath), JSON.stringify(jobManifest, null, 2) + '\n', 'utf8');
    console.error(`Job failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
