import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const fullDir = path.join(root, 'data', 'generated', 'full');

const targetMap = {
  'it-dev': 2000,
  design: 1400,
  'ai-data': 1600,
  marketing: 1000,
  startup: 1000,
  fintech: 1000,
  'bio-health': 900,
  legal: 900,
  'game-xr': 800,
  ecommerce: 800,
  'energy-esg': 800,
  creator: 800
};

const percent = (n, total) => (total > 0 ? Number(((n / total) * 100).toFixed(2)) : 0);

export const reportCollection = () => {
  const files = fs.readdirSync(fullDir).filter((file) => file.endsWith('.terms.json'));

  const domains = files.map((file) => {
    const slug = file.replace('.terms.json', '');
    const target = targetMap[slug] ?? 0;
    const terms = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf8'));
    const difficulty = { novice: 0, beginner: 0, intermediate: 0, advanced: 0 };

    for (const t of terms) {
      difficulty[t.difficulty] += 1;
    }

    return {
      slug,
      target,
      collected: terms.length,
      completion_rate: percent(terms.length, target),
      difficulty,
      difficulty_rate: {
        novice: percent(difficulty.novice, terms.length),
        beginner: percent(difficulty.beginner, terms.length),
        intermediate: percent(difficulty.intermediate, terms.length),
        advanced: percent(difficulty.advanced, terms.length)
      }
    };
  });

  const totalCollected = domains.reduce((sum, d) => sum + d.collected, 0);
  const totalTarget = Object.values(targetMap).reduce((sum, n) => sum + n, 0);

  const out = {
    generated_at: '2026-02-20',
    domains,
    total_collected: totalCollected,
    total_target: totalTarget,
    total_completion_rate: percent(totalCollected, totalTarget)
  };

  const outPath = path.join(root, 'data', 'generated', 'collection-report.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`saved ${outPath}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  reportCollection();
}
