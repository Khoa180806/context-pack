import type { PresetScenario } from '@/types/playground';

export const PRESET_SCENARIOS: PresetScenario[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 1 — Auth bug: session expiry + JWT blacklist (> 150 lines per file)
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
    recommendedBudget: 2500,
    files: [
      {
        name: 'src/auth/session.ts',
        language: 'typescript',
        content: `/**
 * SessionManager — Production in-memory session store with TTL, eviction,
 * telemetry metrics, and multi-tenant session revocation support.
 */
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { isTokenBlacklisted } from './tokenService';

export interface SessionData {
  sessionId: string;
  userId: string;
  tenantId: string;
  roles: string[];
  expiresAt: number; // Unix epoch milliseconds
  createdAt: number;
  lastAccessedAt: number;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
}

export interface SessionCreateOptions {
  ttlSeconds?: number;
  tenantId?: string;
  roles?: string[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionStoreMetrics {
  totalCreated: number;
  totalRevoked: number;
  totalExpired: number;
  currentActive: number;
}

export class SessionManager extends EventEmitter {
  private readonly activeSessions = new Map<string, SessionData>();
  private readonly userIndex = new Map<string, Set<string>>();
  private readonly MAX_SESSIONS_PER_USER = 5;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private metrics: SessionStoreMetrics = {
    totalCreated: 0,
    totalRevoked: 0,
    totalExpired: 0,
    currentActive: 0,
  };

  constructor() {
    super();
    this.startPeriodicCleanup();
  }

  public getMetrics(): SessionStoreMetrics {
    return { ...this.metrics, currentActive: this.activeSessions.size };
  }

  public setMaxSessionsPerUser(max: number): void {
    if (max > 0) {
      (this as any).MAX_SESSIONS_PER_USER = max;
    }
  }

  private startPeriodicCleanup(): void {
    // Run cleanup sweep every 60 seconds
    this.cleanupTimer = setInterval(() => {
      this.evictExpiredSessions();
    }, 60_000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  public stopPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  public evictExpiredSessions(): number {
    const now = Date.now();
    let evictedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(sessionId);
        this.removeFromUserIndex(session.userId, sessionId);
        this.metrics.totalExpired++;
        evictedCount++;
        this.emit('sessionExpired', { sessionId, userId: session.userId });
      }
    }
    return evictedCount;
  }

  public createSession(userId: string, opts: SessionCreateOptions = {}): string {
    const {
      ttlSeconds = 3600,
      tenantId = 'default',
      roles = ['user'],
      ipAddress,
      userAgent,
      metadata = {},
    } = opts;

    this.pruneOldestUserSessions(userId);

    const sessionId = 'sess_' + crypto.randomBytes(24).toString('hex');
    const now = Date.now();

    const session: SessionData = {
      sessionId,
      userId,
      tenantId,
      roles,
      expiresAt: now + ttlSeconds * 1000,
      createdAt: now,
      lastAccessedAt: now,
      ipAddress,
      userAgent,
      metadata,
    };

    this.activeSessions.set(sessionId, session);
    this.addToUserIndex(userId, sessionId);

    this.metrics.totalCreated++;
    this.emit('sessionCreated', { sessionId, userId, tenantId });
    return sessionId;
  }

  /**
   * TARGET HOTSPOT: validateSession
   * Validates active session expiry, updates last access timestamp,
   * and consults token blacklist service for external revocation.
   */
  public validateSession(sessionId: string): SessionData | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    const now = Date.now();

    // Check expiry timestamp against current system time (ms)
    if (now > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      this.removeFromUserIndex(session.userId, sessionId);
      this.metrics.totalExpired++;
      this.emit('sessionExpired', { sessionId, userId: session.userId });
      return null;
    }

    // Critical validation check: consult JWT blacklist
    if (isTokenBlacklisted(sessionId)) {
      this.activeSessions.delete(sessionId);
      this.removeFromUserIndex(session.userId, sessionId);
      this.metrics.totalRevoked++;
      this.emit('sessionRevoked', { sessionId, userId: session.userId, reason: 'blacklisted' });
      return null;
    }

    // Touch access time
    session.lastAccessedAt = now;
    return session;
  }

  public revokeSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    this.activeSessions.delete(sessionId);
    this.removeFromUserIndex(session.userId, sessionId);
    this.metrics.totalRevoked++;
    this.emit('sessionRevoked', { sessionId, userId: session.userId, reason: 'explicit' });
    return true;
  }

  public revokeAllUserSessions(userId: string): number {
    const sessionIds = this.userIndex.get(userId);
    if (!sessionIds || sessionIds.size === 0) return 0;

    let count = 0;
    for (const sessionId of Array.from(sessionIds)) {
      if (this.revokeSession(sessionId)) {
        count++;
      }
    }
    return count;
  }

  public getActiveSessions(userId: string): SessionData[] {
    const sessionIds = this.userIndex.get(userId);
    if (!sessionIds) return [];

    const result: SessionData[] = [];
    for (const sid of sessionIds) {
      const sess = this.activeSessions.get(sid);
      if (sess) result.push(sess);
    }
    return result;
  }

  private addToUserIndex(userId: string, sessionId: string): void {
    if (!this.userIndex.has(userId)) {
      this.userIndex.set(userId, new Set());
    }
    this.userIndex.get(userId)!.add(sessionId);
  }

  private removeFromUserIndex(userId: string, sessionId: string): void {
    const set = this.userIndex.get(userId);
    if (set) {
      set.delete(sessionId);
      if (set.size === 0) this.userIndex.delete(userId);
    }
  }

  private pruneOldestUserSessions(userId: string): void {
    const userSessions = this.getActiveSessions(userId);
    if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
      const sorted = userSessions.sort((a, b) => a.createdAt - b.createdAt);
      const toEvict = sorted.slice(0, userSessions.length - this.MAX_SESSIONS_PER_USER + 1);
      for (const s of toEvict) {
        this.revokeSession(s.sessionId);
      }
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
 * JWT Token Service — Cryptographic signing, verification, token rotation,
 * and high-performance in-memory revocation blacklist.
 */
import crypto from 'crypto';

export interface JwtHeader {
  alg: 'HS256' | 'HS384' | 'HS512';
  typ: 'JWT';
  kid?: string;
}

export interface JwtPayload {
  sub: string;         // userId
  iss?: string;        // issuer
  aud?: string;        // audience
  iat: number;         // issued-at (epoch seconds)
  exp: number;         // expiry (epoch seconds)
  nbf?: number;        // not-before (epoch seconds)
  jti: string;         // unique token identifier
  roles: string[];
  tenantId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface BlacklistEntry {
  jti: string;
  revokedAt: number;
  reason?: string;
}

// In-memory blacklist for revoked token identifiers
const revokedJtis = new Map<string, BlacklistEntry>();

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production-key-9988';
const ACCESS_TTL_SECONDS = 900;       // 15 minutes
const REFRESH_TTL_SECONDS = 604_800;  // 7 days
const TOKEN_ISSUER = 'context-pack-auth-service';

function base64url(input: Buffer | string): string {
  const str = typeof input === 'string' ? input : input.toString('base64');
  return str.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
}

function hmacSHA256(data: string, secret: string): string {
  return base64url(crypto.createHmac('sha256', secret).update(data).digest('base64'));
}

export function parseTokenHeader(token: string): JwtHeader | null {
  try {
    const [headerB64] = token.split('.');
    if (!headerB64) return null;
    return JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function signToken(
  userId: string,
  roles: string[],
  ttl: number = ACCESS_TTL_SECONDS,
  extraPayload: Partial<JwtPayload> = {},
): string {
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);

  const payload: JwtPayload = {
    sub: userId,
    iss: TOKEN_ISSUER,
    iat: nowSec,
    exp: nowSec + ttl,
    jti: crypto.randomUUID(),
    roles,
    ...extraPayload,
  };

  const headerEncoded = base64url(JSON.stringify(header));
  const bodyEncoded = base64url(JSON.stringify(payload));
  const signature = hmacSHA256(\`\${headerEncoded}.\${bodyEncoded}\`, JWT_SECRET);

  return \`\${headerEncoded}.\${bodyEncoded}.\${signature}\`;
}

/**
 * TARGET HOTSPOT: verifyToken
 * Validates cryptographic signature, expiry epoch, and actively checks blacklist.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, bodyB64, sigB64] = parts;
    const expectedSig = hmacSHA256(\`\${headerB64}.\${bodyB64}\`, JWT_SECRET);

    // Constant-time comparison prevents timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: JwtPayload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    const nowSec = Math.floor(Date.now() / 1000);

    // Validate token expiry timestamp
    if (nowSec >= payload.exp) {
      return null;
    }

    // Validate not-before constraint
    if (payload.nbf && nowSec < payload.nbf) {
      return null;
    }

    // Check if token jti is present in revocation blacklist
    if (revokedJtis.has(payload.jti)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * TARGET HOTSPOT: revokeToken & isTokenBlacklisted
 * Explicitly revokes token by adding its jti to the active blacklist map.
 */
export function revokeToken(token: string, reason: string = 'manual_revocation'): boolean {
  const payload = verifyToken(token);
  if (!payload || !payload.jti) return false;

  revokedJtis.set(payload.jti, {
    jti: payload.jti,
    revokedAt: Date.now(),
    reason,
  });
  return true;
}

export function isTokenBlacklisted(jti: string): boolean {
  return revokedJtis.has(jti);
}

export function purgeExpiredBlacklistEntries(): number {
  let purged = 0;
  const now = Date.now();
  // Evict entries older than maximum token refresh lifetime
  const cutoff = now - REFRESH_TTL_SECONDS * 1000;

  for (const [jti, entry] of revokedJtis.entries()) {
    if (entry.revokedAt < cutoff) {
      revokedJtis.delete(jti);
      purged++;
    }
  }
  return purged;
}

export function issueTokenPair(userId: string, roles: string[]): TokenPair {
  return {
    accessToken: signToken(userId, roles, ACCESS_TTL_SECONDS),
    refreshToken: signToken(userId, roles, REFRESH_TTL_SECONDS),
    expiresIn: ACCESS_TTL_SECONDS,
    tokenType: 'Bearer',
  };
}
`,
      },
      {
        name: 'src/middleware/authGuard.ts',
        language: 'typescript',
        content: `/**
 * Express Authentication Guard & Role-Based Access Control (RBAC) Middleware.
 * Enforces strict JWT verification, session presence, and revocation defense.
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../auth/tokenService';
import { sessionManager, type SessionData } from '../auth/session';

export interface AuthenticatedUser {
  userId: string;
  roles: string[];
  sessionId: string;
  tenantId?: string;
  claims: JwtPayload;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthenticatedUser;
      session?: SessionData;
    }
  }
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  const token = parts[1].trim();
  return token.length > 0 ? token : null;
}

export function logSecurityAudit(event: string, meta: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.info(\`[SECURITY_AUDIT] \${timestamp} - \${event}: \${JSON.stringify(meta)}\`);
}

/**
 * TARGET HOTSPOT: requireAuth
 * Inspects incoming Authorization header, verifies JWT validity,
 * and ensures session manager does not flag the token as expired or revoked.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_MISSING_TOKEN',
        message: 'Missing or malformed Authorization bearer header.',
      },
    });
    return;
  }

  // Cryptographic & expiry validation
  const payload = verifyToken(token);
  if (!payload) {
    logSecurityAudit('AUTH_REJECTED_TOKEN_INVALID', { ip: req.ip, path: req.path });
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_INVALID_TOKEN',
        message: 'Bearer token is invalid, expired, or revoked.',
      },
    });
    return;
  }

  // Session-level verification (ensures server-side eviction sync)
  const session = sessionManager.validateSession(payload.jti);
  if (!session) {
    logSecurityAudit('AUTH_REJECTED_SESSION_EVICTED', {
      userId: payload.sub,
      jti: payload.jti,
    });
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_SESSION_REVOKED',
        message: 'Active user session is expired or terminated.',
      },
    });
    return;
  }

  // Inject session credentials into Express context
  req.session = session;
  req.currentUser = {
    userId: payload.sub,
    roles: payload.roles,
    sessionId: payload.jti,
    tenantId: payload.tenantId,
    claims: payload,
  };

  next();
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.currentUser) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required prior to role check.' },
      });
      return;
    }

    const hasPermission = allowedRoles.some((role) => req.currentUser!.roles.includes(role));
    if (!hasPermission) {
      logSecurityAudit('RBAC_FORBIDDEN', {
        userId: req.currentUser.userId,
        requiredRoles: allowedRoles,
        userRoles: req.currentUser.roles,
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_ROLE',
          message: \`Operation requires one of the following roles: \${allowedRoles.join(', ')}\`,
        },
      });
      return;
    }

    next();
  };
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 2 — Tokenizer: lazy encoder cache & benchmark (> 140 lines)
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
    recommendedBudget: 2200,
    files: [
      {
        name: 'src/tokenizer/cache.ts',
        language: 'typescript',
        content: `/**
 * EncoderCache — High-performance lazy-loading singleton cache for tiktoken encoders.
 *
 * Problem: getEncoding() from js-tiktoken loads heavy WASM binary tables on first
 * call (~120ms). Subsequent invocations must reuse singleton instances to guarantee
 * sub-millisecond execution latency.
 */
import { getEncoding } from 'js-tiktoken';

export type SupportedEncoding = 'cl100k_base' | 'o200k_base' | 'p50k_base' | 'r50k_base';

export interface EncoderCacheEntry {
  encoder: { encode: (text: string) => Uint32Array };
  loadedAt: number;
  hitCount: number;
  lastAccessed: number;
}

export interface CacheStatistics {
  totalHits: number;
  totalMisses: number;
  cachedEncodings: SupportedEncoding[];
}

const memoryCache = new Map<SupportedEncoding, EncoderCacheEntry>();
let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStatistics(): CacheStatistics {
  return {
    totalHits: cacheHits,
    totalMisses: cacheMisses,
    cachedEncodings: Array.from(memoryCache.keys()),
  };
}

/**
 * TARGET HOTSPOT: getEncoder
 * Lazy initializes tokenizer encoders and caches instances in-memory.
 */
export function getEncoder(encoding: SupportedEncoding): EncoderCacheEntry['encoder'] {
  const cached = memoryCache.get(encoding);
  const now = Date.now();

  if (cached) {
    cached.hitCount++;
    cached.lastAccessed = now;
    cacheHits++;
    return cached.encoder;
  }

  // Cache miss: initialize encoder instance
  cacheMisses++;
  const encoder = getEncoding(encoding);

  memoryCache.set(encoding, {
    encoder,
    loadedAt: now,
    hitCount: 0,
    lastAccessed: now,
  });

  return encoder;
}

export function evictEncoder(encoding: SupportedEncoding): boolean {
  return memoryCache.delete(encoding);
}

export function clearEncoderCache(): void {
  memoryCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}
`,
      },
      {
        name: 'src/tokenizer/engine.ts',
        language: 'typescript',
        content: `/**
 * Public Tokenizer Engine — Wraps cached encoders with input validation,
 * bounds checking, and token slicing estimators.
 */
import { getEncoder, type SupportedEncoding } from './cache';

export interface TokenCountResult {
  tokens: number;
  encoding: SupportedEncoding;
  truncated: boolean;
  inputLength: number;
  durationMs: number;
}

export interface TokenizerOptions {
  encoding?: SupportedEncoding;
  maxInputTokens?: number;
}

const VALID_ENCODINGS = new Set<SupportedEncoding>([
  'cl100k_base',
  'o200k_base',
  'p50k_base',
  'r50k_base',
]);

export function isValidEncoding(encoding: string): encoding is SupportedEncoding {
  return VALID_ENCODINGS.has(encoding as SupportedEncoding);
}

/**
 * TARGET HOTSPOT: countTokens
 * Main entry point for token counting operations.
 */
export function countTokens(text: string, opts: TokenizerOptions = {}): TokenCountResult {
  const startTime = performance.now();
  const { encoding = 'cl100k_base', maxInputTokens } = opts;

  if (!isValidEncoding(encoding)) {
    throw new TypeError(\`Unsupported encoding "\${encoding}". Valid options: \${[...VALID_ENCODINGS].join(', ')}\`);
  }

  if (!text || text.length === 0) {
    return {
      tokens: 0,
      encoding,
      truncated: false,
      inputLength: 0,
      durationMs: 0,
    };
  }

  const encoder = getEncoder(encoding);
  let encoded = encoder.encode(text);
  const originalLength = encoded.length;
  let truncated = false;

  if (maxInputTokens !== undefined && encoded.length > maxInputTokens) {
    encoded = encoded.slice(0, maxInputTokens);
    truncated = true;
  }

  const durationMs = performance.now() - startTime;

  return {
    tokens: encoded.length,
    encoding,
    truncated,
    inputLength: originalLength,
    durationMs: parseFloat(durationMs.toFixed(3)),
  };
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 3 — CLI Parser: options & validation (> 150 lines)
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
    recommendedBudget: 2200,
    files: [
      {
        name: 'src/cli/validator.ts',
        language: 'typescript',
        content: `/**
 * CLI Input Validator — Strict sanity checks for flags, file existence,
 * integer token limits, and compliance with the POSIX error specification.
 */
import fs from 'fs';
import path from 'path';

export interface CliFlags {
  task?: string;
  files?: string[];
  budget?: number;
  encoding?: string;
  json?: boolean;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export const VALID_ENCODINGS = ['cl100k_base', 'o200k_base', 'p50k_base', 'r50k_base'];

/**
 * TARGET HOTSPOT: validateFlags
 * Evaluates provided CLI options against business rules and produces
 * a structured array of validation errors for terminal or JSON formatting.
 */
export function validateFlags(flags: CliFlags): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate task argument
  if (!flags.task || !flags.task.trim()) {
    errors.push({
      field: '--task / -t',
      code: 'MISSING_REQUIRED',
      message: 'Task description is required. Provide it with -t "<task>".',
    });
  }

  // Validate files argument
  if (!flags.files || flags.files.length === 0) {
    errors.push({
      field: '--files / -f',
      code: 'MISSING_REQUIRED',
      message: 'At least one target file is required. Provide it with -f "path/to/file".',
    });
  } else {
    for (const filePath of flags.files) {
      const resolved = path.resolve(filePath);
      if (!fs.existsSync(resolved)) {
        errors.push({
          field: '--files / -f',
          code: 'FILE_NOT_FOUND',
          message: \`File not found: \${filePath} (resolved path: \${resolved})\`,
        });
      }
    }
  }

  // Validate budget range
  if (flags.budget !== undefined) {
    if (flags.budget < 100) {
      errors.push({
        field: '--budget / -b',
        code: 'VALUE_TOO_SMALL',
        message: \`Budget of \${flags.budget} is below the 100 token minimum.\`,
      });
    }
    if (flags.budget > 200_000) {
      errors.push({
        field: '--budget / -b',
        code: 'VALUE_TOO_LARGE',
        message: \`Budget of \${flags.budget} exceeds maximum allowed limit of 200,000 tokens.\`,
      });
    }
  }

  return errors;
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESET 4 — Custom
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
    recommendedBudget: 2500,
    files: [],
  },
];
