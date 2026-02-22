#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'data/generated');
fs.mkdirSync(outDir, { recursive: true });

const domains = [
  ['it-dev', 500],
  ['design', 220],
  ['ai-data', 300],
  ['marketing', 250],
  ['startup', 200],
  ['fintech', 250],
  ['bio-health', 200],
  ['legal', 200],
  ['game-xr', 180],
  ['ecommerce', 180],
  ['energy-esg', 180],
  ['creator', 150]
];

for (const [slug, count] of domains) {
  const file = path.join(outDir, `${slug}.template.json`);
  const payload = {
    domain: slug,
    target_count: count,
    generated_at: '2026-02-20',
    items: []
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
}

console.log(`generated ${domains.length} template files at ${outDir}`);
