import { resolveRepoPath } from './paths';

let sharpInstance: any = null;

/**
 * Dynamically imports sharp, giving a clear error message if it's missing.
 */
export async function getSharp() {
  if (sharpInstance) return sharpInstance;
  try {
    const mod = await import('sharp');
    sharpInstance = mod.default || mod;
    return sharpInstance;
  } catch (err) {
    console.error('\x1b[31mError: "sharp" is not installed or could not be loaded.\x1b[0m');
    console.error('Please run the script using the following command to auto-install dependencies:');
    console.error('\x1b[36mnpx -y --package=tsx --package=sharp tsx scripts/assets/... \x1b[0m');
    process.exit(1);
  }
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
}

/**
 * Reads dimensions and format of an image.
 */
export async function getImageInfo(relPath: string): Promise<ImageInfo> {
  const sharp = await getSharp();
  const absPath = resolveRepoPath(relPath);
  const metadata = await sharp(absPath).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || '',
  };
}

export interface ExportOptions {
  inputPath: string;
  outputPathWithoutExt: string;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string; // 'attention', 'centre', etc.
  formats: ('png' | 'webp' | 'avif' | 'jpeg' | 'jpg')[];
  quality?: number;
}

/**
 * Exports an image to one or more formats with specified resize options.
 */
export async function exportImage(options: ExportOptions): Promise<string[]> {
  const sharp = await getSharp();
  const inputAbs = resolveRepoPath(options.inputPath);
  const outAbsBase = resolveRepoPath(options.outputPathWithoutExt);

  const exportedFiles: string[] = [];

  for (const format of options.formats) {
    let pipeline = sharp(inputAbs);

    if (options.width || options.height) {
      const resizeOptions: any = {
        fit: options.fit || 'cover',
      };
      if (options.width) resizeOptions.width = options.width;
      if (options.height) resizeOptions.height = options.height;

      // Handle special positioning like 'attention' if supported by sharp
      if (options.position) {
        if (options.position === 'attention') {
          // 'attention' strategy uses sharp.strategy.attention
          resizeOptions.position = sharp.strategy.attention;
        } else if (options.position === 'entropy') {
          resizeOptions.position = sharp.strategy.entropy;
        } else {
          resizeOptions.position = options.position;
        }
      }
      pipeline = pipeline.resize(resizeOptions);
    }

    const q = options.quality || 80;
    if (format === 'png') {
      pipeline = pipeline.png({ quality: q });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: q });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality: q });
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality: q });
    }

    const fileExt = format === 'jpeg' ? 'jpg' : format;
    const finalOutPath = `${outAbsBase}.${fileExt}`;
    await pipeline.toFile(finalOutPath);
    exportedFiles.push(finalOutPath);
  }

  return exportedFiles;
}
