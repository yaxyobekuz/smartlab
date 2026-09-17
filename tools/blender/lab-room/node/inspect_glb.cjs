// Verify room.glb against the contract: node node/inspect_glb.cjs <file.glb> [--json out.json]
const fs = require('fs');
const { core, extensions, meshopt } = require('./gt.cjs');

const SPECIAL = ['monitor_screen', 'whiteboard_surface', 'poster_periodic_table', 'clock_face', 'sign_exit',
  ...Array.from({ length: 9 }, (_, i) => `ceiling_light_${i + 1}`), 'fumehood_light', 'alarm_light', 'alarm_bell',
  'fumehood_switch', 'ventilation_switch', 'extinguisher', 'fumehood_sash', 'door'];
const GLASS = ['glass_window_1', 'glass_window_2', 'glass_window_3', 'glass_chem_cabinet', 'glass_fumehood_sash', 'glass_door'];
const CANVAS = ['monitor_screen', 'whiteboard_surface', 'poster_periodic_table', 'clock_face', 'sign_exit'];

(async () => {
  const file = process.argv[2];
  const { MeshoptDecoder } = await meshopt();
  await MeshoptDecoder.ready;
  const io = new core.NodeIO().registerExtensions(extensions.ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read(file);
  const root = doc.getRoot();
  const errors = [];
  let tris = 0;
  let prims = 0;
  const nodes = root.listNodes();
  const byName = new Map();
  for (const n of nodes) byName.set(n.getName(), n);

  const rows = [];
  for (const n of nodes) {
    const mesh = n.getMesh();
    if (!mesh) continue;
    const isGlass = n.getName().startsWith('glass_');
    for (const p of mesh.listPrimitives()) {
      prims++;
      const idx = p.getIndices();
      const count = idx ? idx.getCount() : p.getAttribute('POSITION').getCount();
      tris += count / 3;
      const sem = p.listSemantics();
      const has1 = sem.includes('TEXCOORD_1');
      if (isGlass && has1) errors.push(`${n.getName()}: glass must not have TEXCOORD_1`);
      if (!isGlass && !has1) errors.push(`${n.getName()}: missing TEXCOORD_1`);
      if (!sem.includes('TEXCOORD_0')) errors.push(`${n.getName()}: missing TEXCOORD_0`);
      const t1 = p.getAttribute('TEXCOORD_1');
      if (t1) {
        const mn = t1.getMinNormalized([]), mx = t1.getMaxNormalized([]);
        if (mn[0] < -1e-4 || mn[1] < -1e-4 || mx[0] > 1.0001 || mx[1] > 1.0001) errors.push(`${n.getName()}: TEXCOORD_1 outside [0,1]`);
      }
      rows.push({ node: n.getName(), material: p.getMaterial() ? p.getMaterial().getName() : null, tris: count / 3,
        attrs: sem.map((s) => `${s}:${p.getAttribute(s).getComponentType()}${p.getAttribute(s).getNormalized() ? 'n' : ''}`).join(' ') });
    }
  }
  for (const name of [...SPECIAL, ...GLASS]) {
    const n = byName.get(name);
    if (!n) errors.push(`missing node ${name}`);
    else if (!n.getMesh()) errors.push(`node ${name} has no mesh`);
  }
  for (const name of CANVAS) {
    const n = byName.get(name);
    if (!n || !n.getMesh()) continue;
    const ps = n.getMesh().listPrimitives();
    if (ps.length !== 1) errors.push(`${name}: expected 1 primitive, got ${ps.length}`);
    const uv = ps[0].getAttribute('TEXCOORD_0');
    const mn = uv.getMinNormalized([]), mx = uv.getMaxNormalized([]);
    if (Math.abs(mn[0]) > 0.01 || Math.abs(mn[1]) > 0.01 || Math.abs(mx[0] - 1) > 0.01 || Math.abs(mx[1] - 1) > 0.01)
      errors.push(`${name}: UV0 not spanning 0..1 (${mn} .. ${mx})`);
  }
  const textures = root.listTextures().map((t) => {
    const size = t.getSize();
    return { name: t.getName(), mime: t.getMimeType(), kb: Math.round(t.getImage().byteLength / 1024), size: size ? size.join('x') : '?' };
  });
  const materials = root.listMaterials().map((m) => m.getName());
  const summary = {
    file, bytes: fs.statSync(file).size, nodes: nodes.length, meshes: root.listMeshes().length, primitives: prims,
    triangles: tris, materials: materials.length, textures: textures.length,
    textureKB: textures.reduce((a, t) => a + t.kb, 0), extensionsUsed: root.listExtensionsUsed().map((e) => e.extensionName),
    special: Object.fromEntries([...SPECIAL, ...GLASS].map((nm) => {
      const n = byName.get(nm);
      return [nm, n ? { t: n.getTranslation().map((v) => +v.toFixed(4)), s: n.getScale().map((v) => +v.toFixed(4)), prims: n.getMesh() ? n.getMesh().listPrimitives().length : 0 } : null];
    })),
  };
  console.log(JSON.stringify({ ...summary, special: undefined }, null, 1));
  console.log('\nTEXTURES');
  for (const t of textures) console.log(`  ${t.name.padEnd(34)} ${t.mime.padEnd(11)} ${t.size.padEnd(10)} ${t.kb} KB`);
  console.log('\nPRIMITIVES');
  for (const r of rows) console.log(`  ${r.node.padEnd(26)} ${String(r.material).padEnd(16)} ${String(r.tris).padStart(6)}  ${r.attrs}`);
  console.log('\nSPECIAL NODES');
  for (const [k, v] of Object.entries(summary.special)) console.log(`  ${k.padEnd(24)} ${JSON.stringify(v)}`);
  const i = process.argv.indexOf('--json');
  if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify({ ...summary, textures, primitives: rows, errors }, null, 1));
  if (errors.length) {
    console.log('\nERRORS');
    for (const e of errors) console.log('  ' + e);
    process.exitCode = 1;
  } else console.log('\nOK: all contract checks passed');
})();
