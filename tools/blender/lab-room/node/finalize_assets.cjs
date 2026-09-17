// Build products -> web assets: node node/finalize_assets.cjs <buildDir> <outDir>
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { sharp } = require('./gt.cjs');

(async () => {
  const [buildDir, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  execFileSync(process.execPath, [path.join(__dirname, 'optimize_glb.cjs'), path.join(buildDir, 'room_raw.glb'), path.join(outDir, 'room.glb')], { stdio: 'inherit' });
  // lossless: lossy WebP is 4:2:0 and blocks smooth gradients, which shows as colour fringes at island edges
  const webp = { lossless: true, effort: 6 };
  await sharp(path.join(buildDir, 'lightmap-high.png')).webp(webp).toFile(path.join(outDir, 'lightmap-high.webp'));
  await sharp(path.join(buildDir, 'lightmap-low.png')).webp(webp).toFile(path.join(outDir, 'lightmap-low.webp'));
  await sharp(path.join(buildDir, 'exterior.png')).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(outDir, 'exterior.jpg'));
  for (const f of ['colliders.json', 'room-meta.json']) fs.copyFileSync(path.join(buildDir, f), path.join(outDir, f));
  let total = 0;
  for (const f of fs.readdirSync(outDir).sort()) {
    const st = fs.statSync(path.join(outDir, f));
    if (!st.isFile()) continue;
    total += st.size;
    const meta = /\.(webp|jpg)$/.test(f) ? await sharp(path.join(outDir, f)).metadata() : null;
    console.log(`${f.padEnd(22)} ${(st.size / 1048576).toFixed(2).padStart(6)} MB ${meta ? `${meta.width}x${meta.height}` : ''}`);
  }
  console.log(`${'TOTAL'.padEnd(22)} ${(total / 1048576).toFixed(2).padStart(6)} MB`);
})().catch((e) => { console.error(e); process.exit(1); });
