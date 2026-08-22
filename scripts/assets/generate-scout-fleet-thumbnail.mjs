import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const authPath = '/data/data/com.termux/files/home/.pi/agent/auth.json';
  if (!fs.existsSync(authPath)) {
    throw new Error(`Auth file not found at ${authPath}`);
  }

  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const antigravityCreds = auth['google-antigravity'] || auth['antigravity'];
  if (!antigravityCreds || !antigravityCreds.access) {
    throw new Error('No active Google Antigravity OAuth token found');
  }

  const token = antigravityCreds.access;
  const projectId = antigravityCreds.projectId || 'cloud-code-assist';

  const prompt = `Use case: illustration-story.
Asset type: 16:9 Gaia Research editorial blog thumbnail.
Primary request: A vast, tranquil open-air campsite at twilight with an expansive, calm starry dusk sky occupying 90% of the frame. Four microscopic, tiny 8-year-old chibi Milim scouts (each about 4-5% of total image height) explore and camp together:
1. On the far left, a tiny chibi Milim with long pastel coral-pink hair wearing a black dragonoid hoodie crouches looking through binoculars at the horizon.
2. Near a small canvas tent on the left-center, a second tiny chibi Milim with lavender-tinted hair wearing a soft sky-blue hoodie adjusts a warm glowing mini lantern.
3. In the center, a third tiny chibi Milim with apricot-golden hair wearing a deep plum-purple hoodie checks a tiny folded map with a compass.
4. On the right, a fourth tiny chibi Milim with magenta-pink hair wearing a warm ochre-yellow hoodie sits on a wooden log pointing happily up at the evening stars.
Scale directive: all four tiny Milims together occupy under 8% of the frame; the vast campsite, peaceful distant hills, and huge twilight sky occupy 92% of the frame with massive calm negative space.
Character details: all have long unbound hair (NO TWINTAILS), bright expressive eyes, two tiny yellow star hairpins in their bangs, thigh-high socks with stripes, and distinct palette-coordinated hoodies.
Style: flat editorial screenprint illustration; rich obsidian-indigo, dusk teal, warm lantern amber, and soft pink accents; broad clean shapes, subtle paper texture, peaceful slice-of-life atmosphere.
Constraints: no trees or root imagery; absolutely no text, numbers, letters, logos, UI, charts, diagrams, or watermarks.`;

  const url = 'https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:streamGenerateContent?alt=sse';
  const payload = {
    project: projectId,
    model: 'gemini-3.1-flash-image', // nano-banana-2
    request: {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    }
  };

  console.log('Sending request to Gemini 3.1 Flash Image (nano-banana-2)...');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'antigravity/1.21.9',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const text = await res.text();
  let imageBase64 = null;

  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        const candidates = data.response?.candidates || [];
        for (const cand of candidates) {
          for (const part of (cand.content?.parts || [])) {
            if (part.inlineData?.data) {
              imageBase64 = part.inlineData.data;
              break;
            }
          }
          if (imageBase64) break;
        }
      } catch (e) {
        // ignore incomplete SSE chunk
      }
    }
    if (imageBase64) break;
  }

  if (!imageBase64) {
    throw new Error('No image inlineData found in Gemini response');
  }

  const rawBuf = Buffer.from(imageBase64, 'base64');
  console.log(`Received ${rawBuf.length} raw image bytes.`);

  // Write candidate raw output
  const workbenchDir = path.resolve('assets/workbench/generated');
  fs.mkdirSync(workbenchDir, { recursive: true });
  const workbenchRawPath = path.join(workbenchDir, 'parallel-cheap-scouting-4-milims-raw.png');
  fs.writeFileSync(workbenchRawPath, rawBuf);

  // Resize and compress to production 16:9 WebP at 1600x900
  const webpBuf = await sharp(rawBuf)
    .resize(1600, 900, { fit: 'cover', position: 'center' })
    .webp({ quality: 90 })
    .toBuffer();

  const generatedPath = path.resolve('assets/generated/parallel-cheap-scouting-editorial-thumbnail.webp');
  const publicPath = path.resolve('public/assets/parallel-cheap-scouting-editorial-thumbnail.webp');

  fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });

  fs.writeFileSync(generatedPath, webpBuf);
  fs.writeFileSync(publicPath, webpBuf);

  console.log(`Saved WebP export to:\n- ${generatedPath}\n- ${publicPath}`);
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
