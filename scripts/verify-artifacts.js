import { printArtifactReport, verifyArtifacts } from './lib/artifact-integrity.js';

const report = verifyArtifacts();
printArtifactReport(report);

if (!report.ok) {
  process.exit(1);
}
