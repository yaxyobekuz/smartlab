// Optimize the Blender GLB without renaming/merging nodes (see README: texture, quantization and meshopt rules).
const { core, extensions, functions, sharp, meshopt } = require('./gt.cjs');

function quantizeStaticPositions(doc) {
  let count = 0;
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh || !node.getName().startsWith('static_')) continue;
    const t = node.getTranslation(), r = node.getRotation(), s = node.getScale();
    const identity = t.every((v) => Math.abs(v) < 1e-9) && Math.abs(r[3] - 1) < 1e-9 && s.every((v) => Math.abs(v - 1) < 1e-9);
    if (!identity) throw new Error(`${node.getName()}: expected identity transform`);
    if (mesh.listParents().filter((p) => p.propertyType === 'Node').length !== 1) throw new Error(`${node.getName()}: shared mesh`);
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (pos.listParents().filter((p) => p.propertyType === 'Primitive').length !== 1) throw new Error('shared POSITION accessor');
      const mn = pos.getMin([]), mx = pos.getMax([]);
      for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], mn[i]); max[i] = Math.max(max[i], mx[i]); }
    }
    const c = [0, 1, 2].map((i) => (min[i] + max[i]) / 2);
    const h = Math.max(...[0, 1, 2].map((i) => (max[i] - min[i]) / 2), 1e-6);
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      const src = pos.getArray();
      const dst = new Int16Array(src.length);
      for (let i = 0; i < src.length; i++) {
        const v = (src[i] - c[i % 3]) / h;
        dst[i] = Math.round(Math.max(-1, Math.min(1, v)) * 32767);
      }
      pos.setArray(dst).setNormalized(true);
    }
    node.setTranslation(c).setScale([h, h, h]);
    count++;
  }
  doc.createExtension(extensions.KHRMeshQuantization).setRequired(true);
  return count;
}

(async () => {
  const [input, output] = process.argv.slice(2);
  const { MeshoptEncoder, MeshoptDecoder } = await meshopt();
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  const io = new core.NodeIO()
    .registerExtensions(extensions.ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read(input);
  const P = core.PropertyType;
  const nonNormal = /^(baseColorTexture|metallicRoughnessTexture|emissiveTexture|occlusionTexture)$/;
  // pattern is tested against name OR uri, so give every texture a uri
  for (const t of doc.getRoot().listTextures()) t.setURI(`${t.getName()}.png`);
  await doc.transform(
    functions.dedup({ propertyTypes: [P.TEXTURE, P.MATERIAL], keepUniqueNames: true }),
    functions.prune({ keepAttributes: true, keepLeaves: true, keepSolidTextures: true, keepIndices: true }),
    functions.textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], pattern: /^floor_/, slots: /^normalTexture$/, quality: 90 }),
    functions.textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], pattern: /^floor_/, slots: nonNormal, quality: 88 }),
    functions.textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], pattern: /^(?!floor_)/, slots: /^normalTexture$/, quality: 90 }),
    functions.textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], pattern: /^(?!floor_)/, slots: nonNormal, quality: 88 }),
    functions.reorder({ encoder: MeshoptEncoder, target: 'size' }),
  );
  const q = quantizeStaticPositions(doc);
  await doc.transform(functions.quantize({ pattern: /^TEXCOORD_\d+$/, patternTargets: /^$/, quantizeTexcoord: 16 }));
  doc.createExtension(extensions.EXTMeshoptCompression).setRequired(true)
    .setEncoderOptions({ method: extensions.EXTMeshoptCompression.EncoderMethod.FILTER });
  await io.write(output, doc);
  console.log(`optimized -> ${output} (static meshes with quantized positions: ${q})`);
})().catch((e) => { console.error(e); process.exit(1); });
