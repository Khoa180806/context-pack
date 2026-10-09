#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import { pack } from './packer.js';
import { formatResult } from './formatter.js';
import { ContextPackError, ERROR_EXIT_CODES } from './errors.js';

const program = new Command();

program
  .name('context-pack')
  .description('Produce a bounded, reusable package of the most relevant context for an agent task')
  .version('0.1.0')
  .exitOverride((err) => {
    if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
      process.exit(0);
    }
    process.exit(2);
  });

program
  .command('pack')
  .description('Package the most relevant context slices for a development task')
  .requiredOption('-t, --task <text>', 'Task instruction or prompt description')
  .requiredOption('-f, --files <globs...>', 'Target file paths or glob patterns')
  .option('-b, --budget <number>', 'Maximum token ceiling', '4000')
  .option('--encoding <name>', 'Tiktoken tokenizer encoding', 'cl100k_base')
  .option('--max-slice-lines <number>', 'Maximum lines per slice', '100')
  .option('--min-relevance <number>', 'Minimum score threshold (0.0–1.0)', '0')
  .option('-o, --output <file>', 'Write envelope payload to designated JSON path')
  .option('--json', 'Emit machine-readable JSON to stdout', false)
  .action(async (opts) => {
    const isJson = Boolean(opts.json);

    try {
      const budget = Number.parseInt(opts.budget, 10);
      if (Number.isNaN(budget)) {
        throw new ContextPackError('INVALID_INPUT', 'Budget must be a valid integer.');
      }

      const maxSliceLines = Number.parseInt(opts.maxSliceLines, 10);
      const minRelevance = Number.parseFloat(opts.minRelevance);

      const envelope = await pack({
        task: opts.task,
        files: Array.isArray(opts.files) ? opts.files : [opts.files],
        budget,
        encoding: opts.encoding,
        maxSliceLines,
        minRelevance,
        outputFile: opts.output,
      });

      if (isJson) {
        process.stdout.write(JSON.stringify(envelope, null, 2) + '\n');
      } else {
        process.stdout.write(formatResult(envelope) + '\n');
      }

      process.exit(0);
    } catch (error: any) {
      if (error instanceof ContextPackError) {
        const exitCode = ERROR_EXIT_CODES[error.code] ?? 1;
        if (isJson) {
          process.stdout.write(JSON.stringify(error.toEnvelope(), null, 2) + '\n');
        } else {
          process.stderr.write(pc.red(`[ERROR ${error.code}] ${error.message}\n`));
        }
        process.exit(exitCode);
      }

      if (isJson) {
        process.stdout.write(
          JSON.stringify(
            {
              error: {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Unknown error occurred.',
              },
              metadata: { schema_version: '1.0' },
            },
            null,
            2,
          ) + '\n',
        );
      } else {
        process.stderr.write(pc.red(`[INTERNAL_ERROR] ${error.message || error}\n`));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
