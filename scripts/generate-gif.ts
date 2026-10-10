import fs from 'fs';
import path from 'path';
import gifencModule from 'gifenc';
import sharpModule from '../web/node_modules/sharp/dist/index.cjs';

const { GIFEncoder, quantize, applyPalette } = gifencModule;
const sharp = (sharpModule as any).default || sharpModule;

export interface TokenSpan {
  text: string;
  color?: string;
  bold?: boolean;
  dim?: boolean;
}

export interface TerminalLine {
  spans: TokenSpan[];
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Renders an exact replica of the terminal output.
 * Colors exactly match picocolors in standard dark terminal (xterm/iterm/vscode dark):
 * - Default foreground: #f8fafc (bright white / slate-50)
 * - pc.bold: font-weight 700 (#ffffff)
 * - pc.cyan: #06b6d4 (cyan-500) / pc.bold(pc.cyan): #22d3ee (cyan-400, bold)
 * - pc.green: #22c55e (green-500)
 * - pc.blue: #3b82f6 (blue-500)
 * - pc.dim: #64748b (slate-500 / muted gray)
 * - Prompt / command: #38bdf8 (sky-400) & flags #94a3b8
 */
function renderSvg(lines: TerminalLine[], showCursor = true, cursorCol = 0, cursorRow = 0): string {
  const lineHeight = 24;
  const startX = 32;
  const startY = 32;

  let contentSvg = '';

  lines.forEach((line, rowIdx) => {
    const y = startY + rowIdx * lineHeight;
    let currentX = startX;

    const spanSvgs = line.spans.map((span) => {
      const color = span.color || '#e2e8f0';
      const weight = span.bold ? 'font-weight: 700;' : 'font-weight: 400;';
      const opacity = span.dim ? 'opacity: 0.75;' : '';
      const style = `${weight} ${opacity}`.trim();
      
      const x = currentX;
      // Approximate monospace width at font-size 13.5px is ~8.1px per char
      const textLen = span.text.length;
      currentX += textLen * 8.1;

      return `<tspan x="${x}" fill="${color}" style="${style}">${escapeXml(span.text)}</tspan>`;
    }).join('');

    contentSvg += `<text y="${y}">${spanSvgs}</text>\n`;
  });

  const cursorX = startX + cursorCol * 8.1;
  const cursorY = startY + cursorRow * lineHeight - 15;
  const cursorSvg = showCursor
    ? `<rect x="${cursorX}" y="${cursorY}" width="8.1" height="18" fill="#38bdf8" opacity="0.9"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 430" width="880" height="430">
  <defs>
    <style>
      text {
        font-family: 'Consolas', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
        font-size: 13.5px;
        letter-spacing: 0px;
      }
    </style>
  </defs>

  <rect width="880" height="430" fill="#090D16"/>

  <g transform="translate(30, 20)">
    <!-- Terminal Outer Frame -->
    <rect width="820" height="390" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Titlebar -->
    <path d="M 0,12 C 0,5.37 5.37,0 12,0 L 808,0 C 814.63,0 820,5.37 820,12 L 820,38 L 0,38 Z" fill="#0f172a"/>
    <line x1="0" y1="38" x2="820" y2="38" stroke="#1e293b" stroke-width="1"/>

    <!-- Window Buttons -->
    <circle cx="22" cy="19" r="6" fill="#f43f5e"/>
    <circle cx="42" cy="19" r="6" fill="#fbbf24"/>
    <circle cx="62" cy="19" r="6" fill="#10b981"/>

    <text x="410" y="24" text-anchor="middle" font-size="12" fill="#64748b" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      bash — cx -t "Task-aware window slicing..."
    </text>

    <!-- Terminal Content Area -->
    <g transform="translate(0, 48)">
      ${contentSvg}
      ${cursorSvg}
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log('Generating CLI demo GIF strictly matching actual picocolors CLI terminal output...');

  // The command executed:
  // $ cx -t "Task-aware window slicing and greedy knapsack packing" -f "src/slicer.ts,src/packer.ts" -b 2000
  const cmdPrompt = '$ ';
  const cmdBody = 'cx -t "Task-aware window slicing and greedy knapsack packing" \\\n    -f "src/slicer.ts,src/packer.ts" -b 2000';

  // Exact output structure from formatResult():
  // 1. pc.bold(pc.cyan('Context Pack'))
  // 2. `${pc.bold('Task:')} ${data.task}`
  // 3. `${pc.bold('Budget:')} ${data.budget_tokens} tokens\n`
  // 4. `  ${pc.green('✓')} ${pc.bold(slice.file)} ${pc.dim(`(lines ${start}–${end})`)}  ${pc.blue(`${tokens} tokens`)}  ${pc.dim(`score: ${score}`)}`
  // 5. `${pc.bold('Total:')} ${budgetUsage}  |  ${counts}  |  ${duration}`

  const fullTerminalLines: TerminalLine[] = [
    // Line 0: Command prompt line 1
    {
      spans: [
        { text: '$ ', color: '#22c55e', bold: true },
        { text: 'cx ', color: '#38bdf8', bold: true },
        { text: '-t ', color: '#a78bfa' },
        { text: '"Task-aware window slicing and greedy knapsack packing" \\', color: '#f1f5f9' },
      ],
    },
    // Line 1: Command continuation line 2
    {
      spans: [
        { text: '    -f ', color: '#a78bfa' },
        { text: '"src/slicer.ts,src/packer.ts" ', color: '#f1f5f9' },
        { text: '-b ', color: '#a78bfa' },
        { text: '2000', color: '#fb923c' },
      ],
    },
    // Line 2: Empty line
    { spans: [{ text: '' }] },
    // Line 3: Header pc.bold(pc.cyan('Context Pack'))
    {
      spans: [
        { text: 'Context Pack', color: '#22d3ee', bold: true },
      ],
    },
    // Line 4: Task line: pc.bold('Task:') Task-aware window slicing and greedy knapsack packing
    {
      spans: [
        { text: 'Task: ', color: '#ffffff', bold: true },
        { text: 'Task-aware window slicing and greedy knapsack packing', color: '#e2e8f0' },
      ],
    },
    // Line 5: Budget line: pc.bold('Budget:') 2000 tokens
    {
      spans: [
        { text: 'Budget: ', color: '#ffffff', bold: true },
        { text: '2000 tokens', color: '#e2e8f0' },
      ],
    },
    // Line 6: Empty line
    { spans: [{ text: '' }] },
    // Line 7: Slice 1:   ✓ src/slicer.ts (lines 4–103)  802 tokens  score: 0.62
    {
      spans: [
        { text: '  ' },
        { text: '✓ ', color: '#22c55e', bold: true },
        { text: 'src/slicer.ts', color: '#ffffff', bold: true },
        { text: ' (lines 4–103)', color: '#64748b', dim: true },
        { text: '  ' },
        { text: '802 tokens', color: '#3b82f6' },
        { text: '  ' },
        { text: 'score: 0.62', color: '#64748b', dim: true },
      ],
    },
    // Line 8: Slice 2:   ✓ src/packer.ts (lines 1–100)  716 tokens  score: 0.34
    {
      spans: [
        { text: '  ' },
        { text: '✓ ', color: '#22c55e', bold: true },
        { text: 'src/packer.ts', color: '#ffffff', bold: true },
        { text: ' (lines 1–100)', color: '#64748b', dim: true },
        { text: '  ' },
        { text: '716 tokens', color: '#3b82f6' },
        { text: '  ' },
        { text: 'score: 0.34', color: '#64748b', dim: true },
      ],
    },
    // Line 9: Empty line
    { spans: [{ text: '' }] },
    // Line 10: Summary footer: pc.bold('Total:') 1518 / 2000 tokens  |  2 slices from 2 files  |  255ms
    {
      spans: [
        { text: 'Total: ', color: '#ffffff', bold: true },
        { text: '1518 / 2000 tokens', color: '#22d3ee', bold: true },
        { text: '  |  ', color: '#64748b' },
        { text: '2 slices from 2 files', color: '#e2e8f0' },
        { text: '  |  ', color: '#64748b' },
        { text: '255ms', color: '#a78bfa' },
      ],
    },
  ];

  // Build animation sequence
  const frames: Array<{ lines: TerminalLine[]; cursorCol: number; cursorRow: number; duration: number }> = [];

  // 1. Initial empty prompt
  frames.push({
    lines: [{ spans: [{ text: '$ ', color: '#22c55e', bold: true }] }],
    cursorCol: 2,
    cursorRow: 0,
    duration: 600,
  });

  // 2. Typing line 1
  const line1Text = 'cx -t "Task-aware window slicing and greedy knapsack packing" \\';
  const step = 6;
  for (let i = 3; i <= line1Text.length; i += step) {
    frames.push({
      lines: [
        {
          spans: [
            { text: '$ ', color: '#22c55e', bold: true },
            { text: line1Text.slice(0, i), color: '#38bdf8' },
          ],
        },
      ],
      cursorCol: 2 + i,
      cursorRow: 0,
      duration: 100,
    });
  }

  // Finish line 1
  frames.push({
    lines: [fullTerminalLines[0]],
    cursorCol: 2 + line1Text.length,
    cursorRow: 0,
    duration: 200,
  });

  // 3. Typing line 2
  const line2Text = '    -f "src/slicer.ts,src/packer.ts" -b 2000';
  for (let j = 4; j <= line2Text.length; j += step) {
    frames.push({
      lines: [
        fullTerminalLines[0],
        {
          spans: [
            { text: line2Text.slice(0, j), color: '#f1f5f9' },
          ],
        },
      ],
      cursorCol: j,
      cursorRow: 1,
      duration: 100,
    });
  }

  // Finish full command and pause slightly before execution
  frames.push({
    lines: [fullTerminalLines[0], fullTerminalLines[1]],
    cursorCol: line2Text.length,
    cursorRow: 1,
    duration: 500,
  });

  // 4. Output lines appear step by step
  // Header + Task + Budget
  frames.push({
    lines: fullTerminalLines.slice(0, 6),
    cursorCol: 0,
    cursorRow: 5,
    duration: 350,
  });

  // Slices appear
  frames.push({
    lines: fullTerminalLines.slice(0, 9),
    cursorCol: 0,
    cursorRow: 8,
    duration: 400,
  });

  // Summary footer appears (Hold for 3500ms)
  frames.push({
    lines: fullTerminalLines,
    cursorCol: 0,
    cursorRow: 11,
    duration: 3500,
  });

  // Render to GIF via sharp and gifenc
  const gif = GIFEncoder();
  const width = 880;
  const height = 430;

  for (let idx = 0; idx < frames.length; idx++) {
    const f = frames[idx];
    const isLast = idx === frames.length - 1;
    const svgStr = renderSvg(f.lines, !isLast, f.cursorCol, f.cursorRow);

    const pngBuffer = await sharp(Buffer.from(svgStr)).resize(width, height).raw().toBuffer();
    const rgba = new Uint8Array(pngBuffer);

    const palette = quantize(rgba, 256, { format: 'rgba4444' });
    const indexed = applyPalette(rgba, palette, 'rgba4444');

    gif.writeFrame(indexed, width, height, {
      palette,
      delay: f.duration,
      repeat: 0,
    });
  }

  gif.finish();
  const gifBuffer = Buffer.from(gif.bytes());

  const targetPath1 = path.resolve('docs/assets/screenshots/cli-demo.gif');
  const targetPath2 = path.resolve('web/public/screenshots/cli-demo.gif');

  fs.writeFileSync(targetPath1, gifBuffer);
  console.log(`Saved updated GIF to: ${targetPath1} (${gifBuffer.length} bytes)`);

  if (fs.existsSync(path.dirname(targetPath2))) {
    fs.writeFileSync(targetPath2, gifBuffer);
    console.log(`Saved updated GIF to: ${targetPath2}`);
  }

  // Generate PNG screenshot for static documentation
  const finalSvg = renderSvg(fullTerminalLines, false, 0, 0);
  const targetPng = path.resolve('docs/assets/screenshots/terminal-demo.png');
  await sharp(Buffer.from(finalSvg)).png().toFile(targetPng);
  console.log(`Saved updated terminal-demo.png to: ${targetPng}`);
}

main().catch((err) => {
  console.error('Failed to generate GIF:', err);
  process.exit(1);
});
