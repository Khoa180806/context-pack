import pc from 'picocolors';
import type { ContextPackEnvelope } from './types.js';

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

export function formatResult(envelope: ContextPackEnvelope): string {
  const { data, metadata } = envelope;
  const lines: string[] = [];

  // Header section
  lines.push(pc.bold(pc.cyan('Context Pack — T02')));
  lines.push(`${pc.bold('Task:')} ${data.task}`);
  lines.push(`${pc.bold('Budget:')} ${data.budget_tokens} tokens\n`);

  // Slices table
  if (data.slices.length === 0) {
    lines.push(pc.yellow('  (No matching context slices extracted)'));
  } else {
    for (const slice of data.slices) {
      const checkMark = pc.green('✓');
      const filePath = pc.bold(slice.file);
      const lineRange = pc.dim(`(lines ${slice.start_line}–${slice.end_line})`);
      const tokenCount = pc.blue(`${slice.tokens} tokens`);
      const score = pc.dim(`score: ${slice.relevance_score.toFixed(2)}`);

      lines.push(`  ${checkMark} ${filePath} ${lineRange}  ${tokenCount}  ${score}`);
    }
  }

  lines.push('');

  // Total summary footer
  const budgetUsage = `${data.used_tokens} / ${data.budget_tokens} tokens`;
  const counts = `${data.slice_count} slices from ${data.file_count} files`;
  const duration = `${metadata.duration_ms}ms`;

  const statusTag = data.truncated ? pc.yellow(' [TRUNCATED]') : '';
  const summaryLine = `${pc.bold('Total:')} ${budgetUsage}  |  ${counts}  |  ${duration}${statusTag}`;

  lines.push(summaryLine);

  return lines.join('\n');
}
