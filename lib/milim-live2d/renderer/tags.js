/*
 * matchTag / KNOWN_TAGS extracted from Stretchy Studio src/io/psdOrganizer.js
 * https://github.com/MangoLion/stretchystudio — Copyright (c) 2026 Nguyen Phan, MIT.
 * Only the layer-name tag matcher is needed by the runtime (iris/eyewhite stencil
 * clipping). See NOTICE at repo root.
 */

export const KNOWN_TAGS = [
  'back hair', 'front hair',
  'headwear', 'face', 'irides', 'eyebrow', 'eyewhite', 'eyelash', 'eyewear',
  'ears', 'earwear', 'nose', 'mouth',
  'neck', 'neckwear', 'topwear', 'handwear', 'bottomwear', 'legwear', 'footwear',
  'tail', 'wings', 'objects',
];

export function matchTag(name) {
  const lower = String(name ?? '').toLowerCase().trim();
  // Exact match first — prevents 'handwear' from matching 'handwear-l', etc.
  for (const tag of KNOWN_TAGS) {
    if (lower === tag) return tag;
  }
  for (const tag of KNOWN_TAGS) {
    if (
      lower.startsWith(tag + '-') ||
      lower.startsWith(tag + ' ') ||
      lower.startsWith(tag + '_')
    ) return tag;
  }
  return null;
}
