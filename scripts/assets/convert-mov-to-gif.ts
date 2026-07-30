import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Helper script for Gaia Image & Media Production Harness
 * Converts a .mov screen recording to an optimized GIF using ffmpeg palettegen.
 */
export function convertMovToGif(inputPath: string, outputPath: string, fps = 15, width = 1200) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input video file does not exist: ${inputPath}`);
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Optimized two-pass palettegen filter graph for clean colors & small file size
  const filterGraph = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`;

  const cmd = `ffmpeg -y -i "${inputPath}" -vf "${filterGraph}" "${outputPath}"`;
  console.log(`Executing ffmpeg conversion:\n  ${cmd}`);

  execSync(cmd, { stdio: "inherit" });
  console.log(`Successfully created GIF: ${outputPath}`);
}

// CLI runner when executed directly
if (process.argv[1]?.endsWith("convert-mov-to-gif.ts")) {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];

  if (!inputArg || !outputArg) {
    console.log("Usage: npx tsx scripts/assets/convert-mov-to-gif.ts <input.mov> <output.gif>");
    process.exit(1);
  }

  convertMovToGif(inputArg, outputArg);
}
