import fs from 'fs';
import path from 'path';
import gifencModule from 'gifenc';
import sharpModule from '../web/node_modules/sharp/dist/index.cjs';

const { GIFEncoder, quantize, applyPalette } = gifencModule;
const sharp = (sharpModule as any).default || sharpModule;


interface FrameDef {
  textLines: string[];
  durationMs: number;
}

function generateSvgFrame(lines: Array<{ text: string; color?: string; bold?: boolean }>, showCursor = true): string {
  const renderedLines = lines
    .map((l, idx) => {
      const y = 30 + idx * 24;
      const color = l.color || '#cdd6f4';
      const weight = l.bold ? 'font-weight: 700;' : 'font-weight: 400;';
      return `<text x="32" y="${y}" fill="${color}" style="${weight}">${escapeXml(l.text)}</text>`;
    })
    .join('\n');

  const cursorY = 30 + (lines.length - 1) * 24;
  const cursorSvg = showCursor
    ? `<rect x="${32 + (lines[lines.length - 1]?.text.length || 0) * 8.5}" y="${cursorY - 14}" width="8" height="18" fill="#89b4fa" opacity="0.9"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 420" width="880" height="420">
  <defs>
    <filter id="win-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
    <style>
      text {
        font-family: 'Consolas', 'JetBrains Mono', 'Courier New', monospace;
        font-size: 13.5px;
      }
    </style>
  </defs>

  <rect width="880" height="420" fill="#090d16"/>

  <g transform="translate(30, 20)">
    <!-- Terminal Outer Frame -->
    <rect width="820" height="380" rx="12" fill="#131826" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Titlebar -->
    <path d="M 0,12 C 0,5.37 5.37,0 12,0 L 808,0 C 814.63,0 820,5.37 820,12 L 820,38 L 0,38 Z" fill="#0f172a"/>
    <line x1="0" y1="38" x2="820" y2="38" stroke="#1e293b" stroke-width="1"/>

    <!-- Window Buttons -->
    <circle cx="22" cy="19" r="6" fill="#f43f5e"/>
    <circle cx="42" cy="19" r="6" fill="#fbbf24"/>
    <circle cx="62" cy="19" r="6" fill="#10b981"/>

    <text x="410" y="24" text-anchor="middle" font-size="12" fill="#64748b" style="font-family: sans-serif;">
      bash — cx -t "Fix token expiry..."
    </text>

    <!-- Terminal Content Area -->
    <g transform="translate(0, 48)">
      ${renderedLines}
      ${cursorSvg}
    </g>
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('Generating CLI demo GIF with Task-Aware Window Slicing output...');

  const cmdLine1 = '$ cx -t "Fix token expiry validation in SessionManager" \\';
  const cmdLine2 = '    -f "src/auth/session.ts" "src/auth/tokenService.ts" -b 1500';

  const fullOutput = [
    { text: cmdLine1, color: '#00f2fe', bold: true },
    { text: cmdLine2, color: '#38bdf8' },
    { text: '', color: '#cdd6f4' },
    { text: 'Context Pack', color: '#00f2fe', bold: true },
    { text: 'Task: Fix token expiry validation in SessionManager', color: '#f1f5f9', bold: true },
    { text: 'Budget: 1500 tokens', color: '#94a3b8' },
    { text: '', color: '#cdd6f4' },
    { text: '  ✓ src/auth/session.ts (lines 85–184)  820 tokens  score: 0.88', color: '#34d399', bold: true },
    { text: '  ✓ src/auth/tokenService.ts (lines 60–159)  545 tokens  score: 0.72', color: '#38bdf8' },
    { text: '', color: '#cdd6f4' },
    { text: 'Total: 1365 / 1500 tokens  |  2 slices from 2 files  |  21.4ms', color: '#a5b4fc', bold: true },
  ];

  // Animation frames sequence
  const framesData: Array<{ lines: Array<{ text: string; color?: string; bold?: boolean }>; duration: number }> = [];

  // Frame 1: Empty prompt
  framesData.push({ lines: [{ text: '$ ', color: '#94a3b8' }], duration: 600 });

  // Typing cmdLine1 in chunks
  const step = 8;
  for (let i = 4; i <= cmdLine1.length; i += step) {
    framesData.push({
      lines: [{ text: cmdLine1.slice(0, i), color: '#00f2fe', bold: true }],
      duration: 120,
    });
  }
  framesData.push({
    lines: [{ text: cmdLine1, color: '#00f2fe', bold: true }],
    duration: 250,
  });

  // Typing cmdLine2 in chunks
  for (let j = 4; j <= cmdLine2.length; j += step) {
    framesData.push({
      lines: [
        { text: cmdLine1, color: '#00f2fe', bold: true },
        { text: cmdLine2.slice(0, j), color: '#38bdf8' },
      ],
      duration: 120,
    });
  }

  // Pre-execution pause with full command
  framesData.push({
    lines: [
      { text: cmdLine1, color: '#00f2fe', bold: true },
      { text: cmdLine2, color: '#38bdf8' },
    ],
    duration: 500,
  });

  // Output header appears
  framesData.push({
    lines: fullOutput.slice(0, 6),
    duration: 350,
  });

  // Slices appear
  framesData.push({
    lines: fullOutput.slice(0, 9),
    duration: 400,
  });

  // Full summary line appears (Hold final result for 3.5s)
  framesData.push({
    lines: fullOutput,
    duration: 3500,
  });

  // Render frames to RGB buffers via sharp
  const gif = GIFEncoder();
  const width = 880;
  const height = 420;

  for (let idx = 0; idx < framesData.length; idx++) {
    const f = framesData[idx];
    const isLast = idx === framesData.length - 1;
    const svgStr = generateSvgFrame(f.lines, !isLast);

    const pngBuffer = await sharp(Buffer.from(svgStr)).resize(width, height).raw().toBuffer();
    const rgba = new Uint8Array(pngBuffer);

    // Quantize RGBA to 256 colors
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

  // Also write PNG snapshot for preview
  const finalSvg = generateSvgFrame(fullOutput, false);
  const targetPng = path.resolve('docs/assets/screenshots/terminal-demo.png');
  await sharp(Buffer.from(finalSvg)).png().toFile(targetPng);
  console.log(`Saved updated terminal-demo.png to: ${targetPng}`);
}

main().catch((err) => {
  console.error('Failed to generate GIF:', err);
  process.exit(1);
});
