import fs from 'node:fs';
import path from 'node:path';
import { generateDetailedData } from './generate-detailed-data.mjs';
import { generateDiagnosticQuizzes } from './generate-diagnostic-quizzes.mjs';
import { validateDetailedData } from './validate-detailed-data.mjs';
import { reportCollection } from './report-collection.mjs';

const root = process.cwd();
const generatedDir = path.join(root, 'data', 'generated');
const reportPath = path.join(generatedDir, 'collection-report.json');
const workflowPath = path.join(generatedDir, 'workflow-run.json');

const steps = [
  { name: 'generate', run: generateDetailedData },
  { name: 'diagnostic_quiz', run: generateDiagnosticQuizzes },
  { name: 'validate', run: validateDetailedData },
  { name: 'report', run: reportCollection }
];

const readReportSummary = () => {
  if (!fs.existsSync(reportPath)) return null;

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  return {
    total_collected: report.total_collected,
    total_target: report.total_target,
    total_completion_rate: report.total_completion_rate,
    domains: Array.isArray(report.domains) ? report.domains.length : 0
  };
};

const run = () => {
  fs.mkdirSync(generatedDir, { recursive: true });

  const workflowStartedAt = new Date().toISOString();
  const results = [];
  let ok = true;

  for (const step of steps) {
    const startedAt = new Date().toISOString();
    try {
      step.run();
      results.push({
        name: step.name,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        status: 'passed'
      });
    } catch (error) {
      ok = false;
      results.push({
        name: step.name,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
      break;
    }
  }

  const payload = {
    started_at: workflowStartedAt,
    ended_at: new Date().toISOString(),
    status: ok ? 'passed' : 'failed',
    steps: results,
    report_summary: readReportSummary()
  };

  fs.writeFileSync(workflowPath, `${JSON.stringify(payload, null, 2)}\n`);

  if (!ok) {
    console.error(`workflow failed. details: ${workflowPath}`);
    process.exit(1);
  }

  console.log(`workflow passed. details: ${workflowPath}`);
};

run();
