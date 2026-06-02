import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, '..', 'public');
const src = join(pub, 'app-icon.svg');

// [出力ファイル名, サイズ, 余白を入れるか(maskableのセーフゾーン用)]
const targets = [
  ['pwa-192x192.png', 192, false],
  ['pwa-512x512.png', 512, false],
  ['maskable-icon-512x512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
];

for (const [name, size, padded] of targets) {
  if (padded) {
    // maskable / apple用：背景色で塗ったキャンバスにアイコンを80%で配置
    const inner = Math.round(size * 0.8);
    const offset = Math.round((size - inner) / 2);
    const icon = await sharp(src).resize(inner, inner).png().toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: '#1e293b' },
    })
      .composite([{ input: icon, top: offset, left: offset }])
      .png()
      .toFile(join(pub, name));
  } else {
    await sharp(src).resize(size, size).png().toFile(join(pub, name));
  }
  console.log('generated', name);
}
