import type { PresetScenario } from '@/types/playground';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'auth-bug',
    title: {
      en: 'Authentication & Session Bug',
      vi: 'Lỗi Xác Thực & Quản Lý Phiên',
    },
    description: {
      en: 'Investigate token expiry, session eviction, and middleware auth checks.',
      vi: 'Điều tra hết hạn token, hủy phiên không hợp lệ và kiểm tra middleware xác thực.',
    },
    task: {
      en: 'Fix token expiry validation and ensure revoked session tokens throw 401 Unauthorized',
      vi: 'Sửa lỗi kiểm tra hết hạn token và đảm bảo token phiên đã thu hồi trả về mã 401 Unauthorized',
    },
    recommendedBudget: 1200,
    files: [
      {
        name: 'src/auth/session.ts',
        language: 'typescript',
        content: `// Session Manager Module
import { verifyJwt, isTokenBlacklisted } from './tokenService';

export interface SessionData {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

export class SessionManager {
  private activeSessions = new Map<string, SessionData>();

  public createSession(userId: string, ttlSeconds = 3600): string {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.activeSessions.set(sessionId, { sessionId, userId, expiresAt });
    return sessionId;
  }

  public validateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // Bug: was comparing Date.now() in seconds against expiresAt in ms
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return false;
    }
    return true;
  }

  public revokeSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }
}
`,
      },
      {
        name: 'src/middleware/authGuard.ts',
        language: 'typescript',
        content: `// HTTP Request Auth Guard Middleware
import type { Request, Response, NextFunction } from 'express';
import { SessionManager } from '../auth/session';

const sessionManager = new SessionManager();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const isValid = sessionManager.validateSession(token);

  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized: Session is invalid or expired' });
  }

  next();
}
`,
      },
      {
        name: 'src/utils/database.ts',
        language: 'typescript',
        content: `// Database connection pool and health checks
export async function pingDatabase(): Promise<boolean> {
  // Simulating connection query
  return true;
}

export async function executeQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  console.log('Executing query:', sql, params);
  return [];
}
`,
      },
    ],
  },
  {
    id: 'tokenizer-refactor',
    title: {
      en: 'Tokenizer & BPE Cache Refactor',
      vi: 'Tái Cấu Trúc Tokenizer & Bộ Nhớ Đệm BPE',
    },
    description: {
      en: 'Support GPT-4o o200k_base encoding with singleton caching to eliminate overhead.',
      vi: 'Hỗ trợ bảng mã GPT-4o o200k_base kèm bộ nhớ đệm singleton nhằm tối ưu độ trễ.',
    },
    task: {
      en: 'Implement lazy encoder cache for o200k_base and cl100k_base with proper error handling',
      vi: 'Triển khai bộ nhớ đệm encoder singleton cho o200k_base và cl100k_base kèm xử lý ngoại lệ',
    },
    recommendedBudget: 900,
    files: [
      {
        name: 'src/tokenizer/engine.ts',
        language: 'typescript',
        content: `import { getEncoding } from 'js-tiktoken';

export type SupportedEncoding = 'cl100k_base' | 'o200k_base' | 'p50k_base';

const VALID_ENCODINGS = new Set(['cl100k_base', 'o200k_base', 'p50k_base']);
const cache = new Map<string, any>();

export function countTokens(text: string, encoding: SupportedEncoding = 'cl100k_base'): number {
  if (!VALID_ENCODINGS.has(encoding)) {
    throw new Error(\`Unsupported encoding: \${encoding}\`);
  }
  if (!text) return 0;

  let enc = cache.get(encoding);
  if (!enc) {
    enc = getEncoding(encoding);
    cache.set(encoding, enc);
  }
  return enc.encode(text).length;
}
`,
      },
      {
        name: 'src/tokenizer/benchmark.ts',
        language: 'typescript',
        content: `import { countTokens } from './engine';

export function runTokenizerBenchmark(iterations = 1000) {
  const sample = "Context Pack provides zero-WASM pure JS deterministic token slicing.";
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    countTokens(sample, 'cl100k_base');
  }
  return performance.now() - t0;
}
`,
      },
      {
        name: 'src/config/limits.ts',
        language: 'typescript',
        content: `export const TOKEN_LIMITS = {
  MIN_BUDGET: 100,
  MAX_BUDGET: 128000,
  DEFAULT_BUDGET: 4000,
};
`,
      },
    ],
  },
  {
    id: 'cli-config',
    title: {
      en: 'CLI Option Parser & Exit Codes',
      vi: 'Xử Lý Tùy Chọn CLI & Mã Thoát',
    },
    description: {
      en: 'Handle missing task flags, default budget thresholds, and structured exit codes.',
      vi: 'Xử lý cờ task còn thiếu, ngưỡng ngân sách mặc định và các mã thoát có cấu trúc.',
    },
    task: {
      en: 'Add validation for missing files flag and ensure exit code 2 on user syntax error',
      vi: 'Thêm kiểm tra tính hợp lệ khi thiếu cờ files và đảm bảo trả mã thoát 2 khi có lỗi cú pháp',
    },
    recommendedBudget: 1100,
    files: [
      {
        name: 'src/cli/options.ts',
        language: 'typescript',
        content: `export interface CliFlags {
  task?: string;
  files?: string[];
  budget?: number;
  json?: boolean;
}

export function parseCliArguments(args: string[]): CliFlags {
  const flags: CliFlags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-t' || arg === '--task') flags.task = args[++i];
    else if (arg === '-f' || arg === '--files') flags.files = (args[++i] || '').split(',');
    else if (arg === '-b' || arg === '--budget') flags.budget = parseInt(args[++i], 10);
    else if (arg === '--json') flags.json = true;
  }
  return flags;
}
`,
      },
      {
        name: 'src/cli/main.ts',
        language: 'typescript',
        content: `import { parseCliArguments } from './options';

export async function runCli(argv: string[]) {
  const options = parseCliArguments(argv);
  if (!options.task) {
    console.error('Error: Task description is required (-t <task>)');
    process.exit(2);
  }
  if (!options.files || options.files.length === 0) {
    console.error('Error: At least one file is required (-f <files>)');
    process.exit(2);
  }
  console.log('Packing context for task:', options.task);
  process.exit(0);
}
`,
      },
      {
        name: 'src/cli/colors.ts',
        language: 'typescript',
        content: `export const colors = {
  cyan: (str: string) => \`\\x1b[36m\${str}\\x1b[0m\`,
  green: (str: string) => \`\\x1b[32m\${str}\\x1b[0m\`,
  red: (str: string) => \`\\x1b[31m\${str}\\x1b[0m\`,
  dim: (str: string) => \`\\x1b[2m\${str}\\x1b[0m\`,
};
`,
      },
    ],
  },
];
