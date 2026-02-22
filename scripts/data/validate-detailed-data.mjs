import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const fullDir = path.join(root, 'data', 'generated', 'full');

const required = [
  'id', 'slug', 'term_ko', 'term_en', 'domain', 'category', 'difficulty', 'one_line_definition',
  'definitions', 'related_terms', 'source_urls', 'last_reviewed_at', 'reviewer'
];

export const validateDetailedData = () => {
  const files = fs.readdirSync(fullDir).filter((file) => file.endsWith('.terms.json'));

  let invalidCount = 0;
  for (const file of files) {
    const items = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf8'));
    items.forEach((item, idx) => {
      for (const key of required) {
        if (!(key in item)) {
          console.error(`${file}[${idx}] missing key: ${key}`);
          invalidCount += 1;
        }
      }

      if (!item.related_terms?.parent?.length || !item.related_terms?.sibling?.length || !item.related_terms?.child?.length) {
        console.error(`${file}[${idx}] relation minimum not met`);
        invalidCount += 1;
      }

      if (!Array.isArray(item.source_urls) || item.source_urls.length < 2) {
        console.error(`${file}[${idx}] source_urls invalid`);
        invalidCount += 1;
      }
    });
  }

  if (invalidCount > 0) {
    console.error(`validation failed: ${invalidCount} issue(s)`);
    process.exit(1);
  }

  console.log(`validation passed for ${files.length} domain files`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateDetailedData();
}
