import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../styles.css', import.meta.url);
const tokens = (await readFile(path, 'utf8')).replaceAll('{', '{\n').replaceAll('}', '\n}\n').replaceAll(';', ';\n').split('\n');
let indent = 0;
const lines = [];
for (const raw of tokens) {
  const line = raw.trim(); if (!line) continue;
  if (line === '}') indent = Math.max(0, indent - 1);
  lines.push('  '.repeat(indent) + line);
  if (line.endsWith('{')) indent++;
}
await writeFile(path, lines.join('\n') + '\n');
