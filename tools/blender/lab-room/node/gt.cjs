// Resolves glTF-Transform + sharp + meshoptimizer from the cached npx install (or GLTF_TRANSFORM_NODE_MODULES).
const path = require('path');
const fs = require('fs');
const os = require('os');
const { createRequire } = require('module');

function findNodeModules() {
  const candidates = [process.env.GLTF_TRANSFORM_NODE_MODULES, path.join(os.homedir(), '.npm/_npx/a6797f7ff67bb1f2/node_modules')];
  const npx = path.join(os.homedir(), '.npm/_npx');
  if (fs.existsSync(npx)) {
    for (const d of fs.readdirSync(npx)) candidates.push(path.join(npx, d, 'node_modules'));
  }
  for (const c of candidates) {
    if (c && fs.existsSync(path.join(c, '@gltf-transform/functions')) && fs.existsSync(path.join(c, 'sharp'))) return c;
  }
  throw new Error('glTF-Transform not found: run `npx @gltf-transform/cli --version` once or set GLTF_TRANSFORM_NODE_MODULES');
}

const NM = findNodeModules();
const req = createRequire(path.join(NM, 'noop.js'));

module.exports = {
  NM,
  core: req('@gltf-transform/core'),
  extensions: req('@gltf-transform/extensions'),
  functions: req('@gltf-transform/functions'),
  sharp: req('sharp'),
  meshopt: () => import(path.join(NM, 'meshoptimizer/index.js')),
};
