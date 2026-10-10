import type { PresetScenario } from '@/types/playground';

export const PRESET_SCENARIOS: PresetScenario[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 1 — Auth bug: session expiry + JWT blacklist
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'auth-bug',
    title: {
      en: 'Auth & Session Bug',
      vi: 'Lỗi Xác Thực & Phiên',
    },
    description: {
      en: 'Token expiry validation, session eviction, JWT blacklist & middleware checks.',
      vi: 'Kiểm tra hết hạn token, hủy phiên, danh sách đen JWT và middleware xác thực.',
    },
    task: {
      en: 'Fix token expiry validation bug: revoked JWT tokens are not being rejected by the auth middleware, causing 200 OK responses instead of 401 Unauthorized on protected routes.',
      vi: 'Sửa lỗi kiểm tra hết hạn token: JWT đã thu hồi không bị từ chối bởi middleware xác thực, dẫn đến phản hồi 200 OK thay vì 401 Unauthorized trên các route được bảo vệ.',
    },
    recommendedBudget: 2000,
    files: [
      {
        name: 'src/auth/session.ts',
        language: 'typescript',
        content: `/**
 * SessionManager — in-memory session store with TTL and revocation support.
 * Bug: validateSession compares epoch-ms expiry against Date.now() / 1000 (seconds).
 */
import crypto from 'crypto';
import { isTokenBlacklisted } from './tokenService';

export interface SessionData {
  sessionId: string;
  userId: string;
  roles: string[];
  expiresAt: number; // Unix epoch milliseconds
  createdAt: number;
  metadata: Record<string, unknown>;
}

export interface SessionCreateOptions {
  ttlSeconds?: number;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

export class SessionManager {
  private readonly activeSessions = new Map<string, SessionData>();
  private readonly MAX_SESSIONS_PER_USER = 5;

  public createSession(userId: string, opts: SessionCreateOptions = {}): string {
    const { ttlSeconds = 3600, roles = ['user'], metadata = {} } = opts;
    this.pruneUserSessions(userId);

    const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    this.activeSessions.set(sessionId, {
      sessionId,
      userId,
      roles,
      expiresAt: now + ttlSeconds * 1000,
      createdAt: now,
      metadata,
    });
    return sessionId;
  }

  /**
   * BUG HERE: Date.now() returns milliseconds, but original code compared against
   * session.expiresAt stored in seconds. Fixed version shown below.
   */
  public validateSession(sessionId: string): SessionData | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Correct comparison: both values must be in the same unit (ms)
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    // Also reject if the underlying JWT was blacklisted externally
    if (isTokenBlacklisted(sessionId)) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return session;
  }

  public revokeSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  public revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [id, sess] of this.activeSessions) {
      if (sess.userId === userId) {
        this.activeSessions.delete(id);
        count++;
      }
    }
    return count;
  }

  public getActiveSessions(userId: string): SessionData[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.userId === userId);
  }

  private pruneUserSessions(userId: string): void {
    const userSessions = this.getActiveSessions(userId);
    if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
      const oldest = userSessions.sort((a, b) => a.createdAt - b.createdAt)[0];
      this.activeSessions.delete(oldest.sessionId);
    }
  }
}

export const sessionManager = new SessionManager();
`,
      },
      {
        name: 'src/auth/tokenService.ts',
        language: 'typescript',
        content: `/**
 * JWT Token Service — sign, verify, refresh, and blacklist management.
 * Uses HS256 signing with configurable secret rotation.
 */
import crypto from 'crypto';

export interface JwtPayload {
  sub: string;       // userId
  iat: number;       // issued-at (epoch seconds)
  exp: number;       // expiry (epoch seconds)
  jti: string;       // unique token ID
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// In-memory blacklist for revoked JTIs — production should use Redis TTL sets
const revokedJtis = new Set<string>();

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const ACCESS_TTL_SECONDS = 900;   // 15 minutes
const REFRESH_TTL_SECONDS = 604800; // 7 days

function base64url(input: Buffer | string): string {
  const str = typeof input === 'string' ? input : input.toString('base64');
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function hmacSHA256(data: string, secret: string): string {
  return base64url(crypto.createHmac('sha256', secret).update(data).digest('base64'));
}

export function signToken(userId: string, roles: string[], ttl = ACCESS_TTL_SECONDS): string {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload: JwtPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttl,
    jti: crypto.randomUUID(),
    roles,
  };
  const body = base64url(Buffer.from(JSON.stringify(payload)));
  const sig = hmacSHA256(\`\${header}.\${body}\`, JWT_SECRET);
  return \`\${header}.\${body}.\${sig}\`;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;

    const expectedSig = hmacSHA256(\`\${header}.\${body}\`, JWT_SECRET);
    if (sig !== expectedSig) return null;

    const payload: JwtPayload = JSON.parse(Buffer.from(body, 'base64url').toString());

    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    if (revokedJtis.has(payload.jti)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function revokeToken(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  revokedJtis.add(payload.jti);
  return true;
}

/** Used by SessionManager to check if a session's backing JWT was externally revoked */
export function isTokenBlacklisted(jti: string): boolean {
  return revokedJtis.has(jti);
}

export function issueTokenPair(userId: string, roles: string[]): TokenPair {
  return {
    accessToken: signToken(userId, roles, ACCESS_TTL_SECONDS),
    refreshToken: signToken(userId, roles, REFRESH_TTL_SECONDS),
    expiresIn: ACCESS_TTL_SECONDS,
  };
}
`,
      },
      {
        name: 'src/middleware/authGuard.ts',
        language: 'typescript',
        content: `/**
 * Express auth middleware — validates Bearer JWT and injects session into req.
 * Bug: middleware calls sessionManager.validateSession() but does NOT check the
 * return value correctly — passes even when null is returned (missing null check).
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/tokenService';
import { sessionManager } from '../auth/session';

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        userId: string;
        roles: string[];
        sessionId: string;
      };
    }
  }
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * requireAuth — blocks requests without a valid, non-expired, non-revoked JWT.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token is invalid, expired, or revoked' });
    return;
  }

  // Session-layer check: ensures the session hasn't been evicted server-side
  const session = sessionManager.validateSession(payload.jti);
  if (!session) {
    res.status(401).json({ error: 'Session no longer active — please log in again' });
    return;
  }

  req.currentUser = {
    userId: payload.sub,
    roles: payload.roles,
    sessionId: payload.jti,
  };

  next();
}

/**
 * requireRole — must be used after requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.currentUser) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }
    const hasRole = roles.some((r) => req.currentUser!.roles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: \`Access denied. Required roles: \${roles.join(', ')}\` });
      return;
    }
    next();
  };
}
`,
      },
      {
        name: 'src/routes/authRouter.ts',
        language: 'typescript',
        content: `/**
 * Express router — /auth endpoints: login, logout, refresh, whoami.
 */
import { Router } from 'express';
import { issueTokenPair, revokeToken, verifyToken } from '../auth/tokenService';
import { sessionManager } from '../auth/session';
import { requireAuth } from '../middleware/authGuard';

export const authRouter = Router();

interface LoginBody {
  username: string;
  password: string;
}

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as LoginBody;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // Demo: accept any non-empty creds; replace with real DB lookup + bcrypt
  const userId = \`user_\${Buffer.from(username).toString('hex')}\`;
  const roles = username === 'admin' ? ['admin', 'user'] : ['user'];

  const tokens = issueTokenPair(userId, roles);
  const sessionId = sessionManager.createSession(userId, { roles });

  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    sessionId,
  });
});

// POST /auth/logout
authRouter.post('/logout', requireAuth, (req, res) => {
  const token = req.headers['authorization']!.slice(7);
  revokeToken(token);

  if (req.currentUser) {
    sessionManager.revokeSession(req.currentUser.sessionId);
  }

  res.json({ message: 'Logged out successfully' });
});

// POST /auth/refresh
authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const payload = verifyToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ error: 'Refresh token is invalid or expired' });
  }

  const tokens = issueTokenPair(payload.sub, payload.roles);
  res.json({ accessToken: tokens.accessToken, expiresIn: tokens.expiresIn });
});

// GET /auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    userId: req.currentUser!.userId,
    roles: req.currentUser!.roles,
    sessionId: req.currentUser!.sessionId,
  });
});

// DELETE /auth/sessions — revoke all sessions for the current user
authRouter.delete('/sessions', requireAuth, (req, res) => {
  const count = sessionManager.revokeAllUserSessions(req.currentUser!.userId);
  res.json({ message: \`Revoked \${count} session(s)\` });
});
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 2 — Tokenizer: lazy encoder cache + o200k_base support
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tokenizer-refactor',
    title: {
      en: 'Tokenizer Cache Refactor',
      vi: 'Tái Cấu Trúc Cache Tokenizer',
    },
    description: {
      en: 'Add o200k_base encoding, singleton cache, graceful error handling & benchmark suite.',
      vi: 'Hỗ trợ bảng mã o200k_base, cache singleton, xử lý lỗi và bộ đo hiệu năng.',
    },
    task: {
      en: 'Refactor the tokenizer engine to support o200k_base (GPT-4o) encoding via a lazy singleton cache. The current implementation re-initialises the encoder on every call, causing ~120ms overhead per request. Target: < 2ms after warm-up.',
      vi: 'Tái cấu trúc engine tokenizer để hỗ trợ bảng mã o200k_base (GPT-4o) thông qua lazy singleton cache. Hiện tại, encoder được khởi tạo lại mỗi lần gọi, gây ra overhead ~120ms. Mục tiêu: < 2ms sau lần khởi động đầu tiên.',
    },
    recommendedBudget: 1800,
    files: [
      {
        name: 'src/tokenizer/types.ts',
        language: 'typescript',
        content: `/**
 * Shared types for the tokenizer subsystem.
 */

export type SupportedEncoding = 'cl100k_base' | 'o200k_base' | 'p50k_base' | 'p50k_edit';

export interface TokenizerOptions {
  encoding?: SupportedEncoding;
  /** Truncate input to this many tokens before counting (optional safety cap) */
  maxInputTokens?: number;
}

export interface TokenCount {
  tokens: number;
  encoding: SupportedEncoding;
  truncated: boolean;
  inputLength: number;
}

export interface BenchmarkResult {
  encoding: SupportedEncoding;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  tokensPerSecond: number;
}

export interface EncoderCacheEntry {
  encoder: { encode: (text: string) => Uint32Array };
  loadedAt: number;
  hitCount: number;
}

/** Map of encoding name → model families that use it */
export const ENCODING_MODEL_MAP: Record<SupportedEncoding, string[]> = {
  cl100k_base: ['gpt-4', 'gpt-3.5-turbo', 'text-embedding-ada-002'],
  o200k_base: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini'],
  p50k_base: ['text-davinci-003', 'text-davinci-002'],
  p50k_edit: ['text-davinci-edit-001'],
};
`,
      },
      {
        name: 'src/tokenizer/cache.ts',
        language: 'typescript',
        content: `/**
 * EncoderCache — lazy-loads and caches tiktoken encoders by name.
 *
 * Problem: getEncoding() from js-tiktoken loads a large WASM binary + BPE vocab
 * on first call (~120ms). Subsequent calls with the same encoding should reuse
 * the instance (< 1ms) instead of re-initialising.
 *
 * This module provides a module-level singleton cache keyed by encoding name.
 */
import { getEncoding } from 'js-tiktoken';
import type { SupportedEncoding, EncoderCacheEntry } from './types';

const cache = new Map<SupportedEncoding, EncoderCacheEntry>();

/**
 * Get (or load) an encoder for the given encoding.
 * Thread-safe for single-threaded JS environments; Node.js Worker threads
 * each maintain their own cache — this is intentional (avoids SharedArrayBuffer).
 */
export function getEncoder(encoding: SupportedEncoding): EncoderCacheEntry['encoder'] {
  const cached = cache.get(encoding);
  if (cached) {
    cached.hitCount++;
    return cached.encoder;
  }

  const encoder = getEncoding(encoding);
  cache.set(encoding, {
    encoder,
    loadedAt: Date.now(),
    hitCount: 0,
  });
  return encoder;
}

/** Evict a specific encoder (useful for testing or forced reload). */
export function evictEncoder(encoding: SupportedEncoding): boolean {
  return cache.delete(encoding);
}

/** Evict all cached encoders and free WASM memory. */
export function clearEncoderCache(): void {
  cache.clear();
}

/** Diagnostic info — helpful for observability. */
export function getCacheStats(): Array<{
  encoding: SupportedEncoding;
  loadedAt: number;
  hitCount: number;
}> {
  return Array.from(cache.entries()).map(([enc, entry]) => ({
    encoding: enc,
    loadedAt: entry.loadedAt,
    hitCount: entry.hitCount,
  }));
}
`,
      },
      {
        name: 'src/tokenizer/engine.ts',
        language: 'typescript',
        content: `/**
 * Public tokenizer API — wraps the encoder cache with validation,
 * truncation support, and structured return types.
 */
import { getEncoder } from './cache';
import type { SupportedEncoding, TokenizerOptions, TokenCount } from './types';

const VALID_ENCODINGS = new Set<SupportedEncoding>([
  'cl100k_base',
  'o200k_base',
  'p50k_base',
  'p50k_edit',
]);

export function isValidEncoding(enc: string): enc is SupportedEncoding {
  return VALID_ENCODINGS.has(enc as SupportedEncoding);
}

/**
 * Count tokens in \`text\` using the specified encoding.
 * Returns a structured result with optional truncation info.
 */
export function countTokens(text: string, opts: TokenizerOptions = {}): TokenCount {
  const { encoding = 'cl100k_base', maxInputTokens } = opts;

  if (!isValidEncoding(encoding)) {
    throw new TypeError(
      \`Unsupported encoding "\${encoding}". Valid options: \${[...VALID_ENCODINGS].join(', ')}\`,
    );
  }

  if (!text) {
    return { tokens: 0, encoding, truncated: false, inputLength: 0 };
  }

  const encoder = getEncoder(encoding);
  let encoded = encoder.encode(text);
  const originalLength = encoded.length;
  let truncated = false;

  if (maxInputTokens !== undefined && encoded.length > maxInputTokens) {
    encoded = encoded.slice(0, maxInputTokens);
    truncated = true;
  }

  return {
    tokens: encoded.length,
    encoding,
    truncated,
    inputLength: originalLength,
  };
}

/**
 * Convenience overload that returns just the token count integer.
 * Matches the legacy \`countTokens(text, encoding)\` call signature.
 */
export function countTokensSimple(text: string, encoding: SupportedEncoding = 'cl100k_base'): number {
  return countTokens(text, { encoding }).tokens;
}

/**
 * Estimate tokens without loading the full encoder — fast approximation
 * using the ~4 chars/token heuristic. Only use for rough UI previews.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function getAvailableEncodings(): SupportedEncoding[] {
  return Array.from(VALID_ENCODINGS);
}
`,
      },
      {
        name: 'src/tokenizer/benchmark.ts',
        language: 'typescript',
        content: `/**
 * Tokenizer benchmark suite — measures cold-start and warm cache latency
 * across all supported encodings. Run with: npx tsx src/tokenizer/benchmark.ts
 */
import { countTokens } from './engine';
import { clearEncoderCache, getCacheStats } from './cache';
import type { SupportedEncoding, BenchmarkResult } from './types';

const ENCODINGS: SupportedEncoding[] = ['cl100k_base', 'o200k_base', 'p50k_base'];

const SAMPLE_TEXTS = [
  'Context Pack provides zero-WASM pure JS deterministic token slicing for LLM context windows.',
  'function authenticate(token: string): Promise<User | null> { return verifyJwt(token); }',
  'The quick brown fox jumps over the lazy dog. Pack context, not clutter.',
];

async function benchmarkEncoding(
  encoding: SupportedEncoding,
  iterations: number,
  text: string,
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    countTokens(text, { encoding });
    times.push(performance.now() - t0);
  }

  const total = times.reduce((a, b) => a + b, 0);
  const tokens = countTokens(text, { encoding }).tokens;

  return {
    encoding,
    iterations,
    totalMs: parseFloat(total.toFixed(3)),
    avgMs: parseFloat((total / iterations).toFixed(3)),
    minMs: parseFloat(Math.min(...times).toFixed(3)),
    maxMs: parseFloat(Math.max(...times).toFixed(3)),
    tokensPerSecond: Math.round((tokens * iterations) / (total / 1000)),
  };
}

export async function runFullBenchmark(iterations = 500): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  const text = SAMPLE_TEXTS.join(' ');

  console.log(\`\\nTokenizer Benchmark — \${iterations} iterations per encoding\`);
  console.log('='.repeat(60));

  for (const encoding of ENCODINGS) {
    // Cold start
    clearEncoderCache();
    const coldResult = await benchmarkEncoding(encoding, 1, text);
    console.log(\`[COLD] \${encoding}: \${coldResult.avgMs}ms\`);

    // Warm cache
    const warmResult = await benchmarkEncoding(encoding, iterations, text);
    console.log(\`[WARM] \${encoding}: avg \${warmResult.avgMs}ms | \${warmResult.tokensPerSecond} tok/s\`);

    results.push(warmResult);
  }

  console.log('\\nCache stats:', getCacheStats());
  return results;
}

// Run when executed directly
if (process.argv[1] === import.meta.url.slice(7)) {
  runFullBenchmark(500).catch(console.error);
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 3 — CLI: argument parsing, validation, structured exit codes
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cli-config',
    title: {
      en: 'CLI Parser & Exit Codes',
      vi: 'Parser CLI & Mã Thoát',
    },
    description: {
      en: 'Argument validation, structured errors, colored output, and exit code spec.',
      vi: 'Kiểm tra tham số, lỗi có cấu trúc, đầu ra màu sắc và đặc tả mã thoát.',
    },
    task: {
      en: 'Add strict validation for the --files flag: missing, empty, or non-existent paths must emit a structured JSON error (when --json) or a colored stderr message (default), and exit with code 2. Currently the CLI silently continues with an empty file list.',
      vi: 'Thêm kiểm tra chặt chẽ cho cờ --files: đường dẫn thiếu, rỗng hoặc không tồn tại phải phát ra lỗi JSON có cấu trúc (khi dùng --json) hoặc thông báo stderr có màu (mặc định), và thoát với mã 2. Hiện tại CLI âm thầm tiếp tục với danh sách file rỗng.',
    },
    recommendedBudget: 1900,
    files: [
      {
        name: 'src/cli/options.ts',
        language: 'typescript',
        content: `/**
 * CLI flag definitions, parser, and default values.
 * Supports both short (-t, -f, -b) and long (--task, --files, --budget) forms.
 */

export interface CliFlags {
  task?: string;
  files?: string[];
  budget?: number;
  encoding?: string;
  json?: boolean;
  verbose?: boolean;
  version?: boolean;
  help?: boolean;
}

export interface ParseResult {
  flags: CliFlags;
  positionals: string[];
  unknown: string[];
}

const SUPPORTED_FLAGS: Record<string, keyof CliFlags> = {
  '-t': 'task',
  '--task': 'task',
  '-f': 'files',
  '--files': 'files',
  '-b': 'budget',
  '--budget': 'budget',
  '-e': 'encoding',
  '--encoding': 'encoding',
  '--json': 'json',
  '-v': 'verbose',
  '--verbose': 'verbose',
  '--version': 'version',
  '-h': 'help',
  '--help': 'help',
};

const BOOLEAN_FLAGS = new Set(['--json', '-v', '--verbose', '--version', '-h', '--help']);

export function parseCliArguments(argv: string[]): ParseResult {
  const flags: CliFlags = {};
  const positionals: string[] = [];
  const unknown: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const flagKey = SUPPORTED_FLAGS[arg];

    if (!flagKey) {
      if (arg.startsWith('-')) {
        unknown.push(arg);
      } else {
        positionals.push(arg);
      }
      continue;
    }

    if (BOOLEAN_FLAGS.has(arg)) {
      (flags as Record<string, unknown>)[flagKey] = true;
      continue;
    }

    const value = argv[++i];
    if (value === undefined) {
      unknown.push(arg);
      continue;
    }

    if (flagKey === 'files') {
      flags.files = value.split(',').map((f) => f.trim()).filter(Boolean);
    } else if (flagKey === 'budget') {
      const parsed = parseInt(value, 10);
      flags.budget = isNaN(parsed) ? undefined : parsed;
    } else {
      (flags as Record<string, unknown>)[flagKey] = value;
    }
  }

  return { flags, positionals, unknown };
}

export const DEFAULTS = {
  budget: 4000,
  encoding: 'cl100k_base',
} as const;
`,
      },
      {
        name: 'src/cli/validator.ts',
        language: 'typescript',
        content: `/**
 * CLI input validator — checks required flags, value ranges, and file existence.
 * Returns structured ValidationError[] so the caller decides how to render them.
 */
import fs from 'fs';
import path from 'path';
import type { CliFlags } from './options';

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export function validateFlags(flags: CliFlags): ValidationError[] {
  const errors: ValidationError[] = [];

  // --task is required
  if (!flags.task || !flags.task.trim()) {
    errors.push({
      field: '--task / -t',
      code: 'MISSING_REQUIRED',
      message: 'Task description is required. Provide it with -t "<task>".',
    });
  } else if (flags.task.length > 2000) {
    errors.push({
      field: '--task / -t',
      code: 'VALUE_TOO_LONG',
      message: \`Task description exceeds 2000 characters (\${flags.task.length} given).\`,
    });
  }

  // --files is required and must be non-empty
  if (!flags.files || flags.files.length === 0) {
    errors.push({
      field: '--files / -f',
      code: 'MISSING_REQUIRED',
      message: 'At least one source file is required. Provide it with -f "path/to/file".',
    });
  } else {
    for (const filePath of flags.files) {
      const resolved = path.resolve(filePath);
      if (!fs.existsSync(resolved)) {
        errors.push({
          field: '--files / -f',
          code: 'FILE_NOT_FOUND',
          message: \`File not found: \${filePath} (resolved: \${resolved})\`,
        });
      } else {
        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
          errors.push({
            field: '--files / -f',
            code: 'PATH_IS_DIRECTORY',
            message: \`Expected a file but got a directory: \${filePath}\`,
          });
        }
      }
    }
  }

  // --budget range check
  if (flags.budget !== undefined) {
    if (flags.budget < 100) {
      errors.push({
        field: '--budget / -b',
        code: 'VALUE_OUT_OF_RANGE',
        message: \`Budget must be at least 100 tokens (got \${flags.budget}).\`,
      });
    }
    if (flags.budget > 200000) {
      errors.push({
        field: '--budget / -b',
        code: 'VALUE_OUT_OF_RANGE',
        message: \`Budget exceeds maximum of 200,000 tokens (got \${flags.budget}).\`,
      });
    }
  }

  // --encoding whitelist
  const VALID_ENCODINGS = ['cl100k_base', 'o200k_base', 'p50k_base', 'p50k_edit'];
  if (flags.encoding && !VALID_ENCODINGS.includes(flags.encoding)) {
    errors.push({
      field: '--encoding / -e',
      code: 'INVALID_VALUE',
      message: \`Unknown encoding "\${flags.encoding}". Valid: \${VALID_ENCODINGS.join(', ')}\`,
    });
  }

  return errors;
}
`,
      },
      {
        name: 'src/cli/formatter.ts',
        language: 'typescript',
        content: `/**
 * CLI output formatting — colored stderr for human mode, JSON for --json mode.
 * Exit codes: 0 = success, 1 = runtime error, 2 = user input error.
 */
import type { ValidationError } from './validator';

// ANSI escape codes (compatible with most modern terminals)
const ESC = '\x1b';
const RESET = \`\${ESC}[0m\`;
const BOLD = \`\${ESC}[1m\`;
const DIM = \`\${ESC}[2m\`;
const RED = \`\${ESC}[31m\`;
const YELLOW = \`\${ESC}[33m\`;
const CYAN = \`\${ESC}[36m\`;
const GREEN = \`\${ESC}[32m\`;

export const colors = {
  error: (s: string) => \`\${BOLD}\${RED}\${s}\${RESET}\`,
  warn: (s: string) => \`\${YELLOW}\${s}\${RESET}\`,
  info: (s: string) => \`\${CYAN}\${s}\${RESET}\`,
  success: (s: string) => \`\${GREEN}\${s}\${RESET}\`,
  dim: (s: string) => \`\${DIM}\${s}\${RESET}\`,
  bold: (s: string) => \`\${BOLD}\${s}\${RESET}\`,
};

export interface StructuredError {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: ValidationError[];
  };
}

export function formatValidationErrors(
  errors: ValidationError[],
  asJson: boolean,
): { output: string; exitCode: 2 } {
  if (asJson) {
    const structured: StructuredError = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: \`\${errors.length} validation error(s) found\`,
        fields: errors,
      },
    };
    return { output: JSON.stringify(structured, null, 2), exitCode: 2 };
  }

  const lines = [
    colors.error(\`✖  \${errors.length} error(s) found:\`),
    '',
    ...errors.map((e, i) =>
      [
        colors.bold(\`  [\${i + 1}] \${e.field}\`),
        \`      \${colors.dim(e.code)}  \${e.message}\`,
      ].join('\\n'),
    ),
    '',
    colors.dim('  Run with --help for usage information.'),
  ];

  return { output: lines.join('\\n'), exitCode: 2 };
}

export function formatRuntimeError(err: unknown, asJson: boolean): { output: string; exitCode: 1 } {
  const message = err instanceof Error ? err.message : String(err);

  if (asJson) {
    return {
      output: JSON.stringify({ ok: false, error: { code: 'RUNTIME_ERROR', message } }, null, 2),
      exitCode: 1,
    };
  }

  return { output: colors.error(\`✖  Runtime error: \${message}\`), exitCode: 1 };
}

export function printHelp(name = 'cx'): void {
  console.log(\`
\${colors.bold(\`\${name}\`)} — AI Context Pack CLI

\${colors.bold('USAGE')}
  \${name} -t <task> -f <files> [options]

\${colors.bold('OPTIONS')}
  -t, --task      \${colors.dim('Required')}  Task description for the AI agent
  -f, --files     \${colors.dim('Required')}  Comma-separated list of source files
  -b, --budget    \${colors.dim('[4000]')}    Token budget (100–200,000)
  -e, --encoding  \${colors.dim('[cl100k]')} Tokenizer encoding
      --json                Output structured JSON envelope
  -v, --verbose             Verbose logging
      --version             Print version and exit
  -h, --help                Show this help

\${colors.bold('EXIT CODES')}
  0  Success
  1  Runtime / unexpected error
  2  Invalid user input (bad flags, missing files)
\`);
}
`,
      },
      {
        name: 'src/cli/main.ts',
        language: 'typescript',
        content: `/**
 * CLI entry point — orchestrates parsing, validation, and execution.
 * Imported by bin/cx.js which sets process.argv.
 */
import { parseCliArguments, DEFAULTS } from './options';
import { validateFlags } from './validator';
import { formatValidationErrors, formatRuntimeError, printHelp } from './formatter';

const VERSION = '0.1.1';

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { flags, unknown } = parseCliArguments(argv);

  // --version
  if (flags.version) {
    console.log(VERSION);
    process.exit(0);
  }

  // --help
  if (flags.help || argv.length === 0) {
    printHelp();
    process.exit(0);
  }

  // Warn about unrecognised flags
  if (unknown.length > 0 && flags.verbose) {
    console.warn(\`Warning: unknown flags ignored: \${unknown.join(', ')}\`);
  }

  // Apply defaults
  flags.budget = flags.budget ?? DEFAULTS.budget;
  flags.encoding = flags.encoding ?? DEFAULTS.encoding;

  // Validate
  const errors = validateFlags(flags);
  if (errors.length > 0) {
    const { output, exitCode } = formatValidationErrors(errors, flags.json ?? false);
    process.stderr.write(output + '\\n');
    process.exit(exitCode);
  }

  // Execute pack
  try {
    // Dynamic import to avoid loading heavy engine at startup (lazy load)
    const { packFiles } = await import('../packer');
    const result = await packFiles({
      task: flags.task!,
      files: flags.files!,
      budget: flags.budget,
      encoding: flags.encoding as 'cl100k_base' | 'o200k_base',
    });

    if (flags.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\\n');
    } else {
      console.log(\`Packed \${result.data.slices.length} slice(s) — \${result.data.used_tokens} tokens used\`);
    }

    process.exit(0);
  } catch (err) {
    const { output, exitCode } = formatRuntimeError(err, flags.json ?? false);
    process.stderr.write(output + '\\n');
    process.exit(exitCode);
  }
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 4 — Custom (sentinel): blank canvas for user's own files
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'custom',
    title: {
      en: 'Custom Scenario',
      vi: 'Kịch Bản Tùy Chỉnh',
    },
    description: {
      en: 'Paste your own source files and write a custom prompt.',
      vi: 'Dán code của bạn và nhập prompt theo nhu cầu riêng.',
    },
    task: {
      en: '',
      vi: '',
    },
    recommendedBudget: 2000,
    files: [], // intentionally empty — user builds their own file set
  },
];
