import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'styles.css', 'src', 'public', 'sw.js']) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (['.html', '.js', '.mjs', '.css', '.svg', '.png', '.wasm', '.task'].includes(extname(path))) result.push(path);
  }
  return result;
}
const paths = (await files(output)).filter(path => !path.endsWith('sw.js')).sort();
const hash = createHash('sha256');
for (const path of paths) hash.update(await readFile(path));
const assets = paths.map(path => '/' + relative(output, path).replaceAll('\\', '/'));
assets.push('/');
const manifest = JSON.stringify({ version: hash.digest('hex').slice(0, 16), assets }, null, 2);
await writeFile(resolve(output, 'offline-assets.json'), manifest);
await writeFile(resolve(root, 'offline-assets.json'), manifest);
console.log(`Static build: ${assets.length} assets in dist. API handlers remain in api/v1 for Vercel.`);
