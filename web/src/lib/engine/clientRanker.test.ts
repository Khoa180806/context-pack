import { describe, it, expect } from 'vitest';
import { extractKeywords, scoreContentRelevance, rankFiles } from './clientRanker';

describe('clientRanker', () => {
  it('extracts English keywords and filters common stop words', () => {
    const keywords = extractKeywords('Fix authentication session bug and token validation');
    expect(keywords).toContain('authentication');
    expect(keywords).toContain('session');
    expect(keywords).toContain('bug');
    expect(keywords).toContain('token');
    expect(keywords).toContain('validation');
    expect(keywords).not.toContain('and');
  });

  it('expands Vietnamese queries using the technical synonym dictionary', () => {
    const keywords = extractKeywords('Sua loi xac thuc va phien dang nhap');
    // xac thuc -> auth, authenticate, verify, token, jwt
    // dang nhap -> login, signin, auth, session
    expect(keywords).toContain('auth');
    expect(keywords).toContain('session');
    expect(keywords).toContain('login');
  });

  it('scores relevance higher when keywords appear frequently and in file name', () => {
    const file1 = {
      name: 'src/auth/session.ts',
      content: 'export function verifySession(token: string) { return authValidate(token); }',
    };
    const file2 = {
      name: 'src/utils/math.ts',
      content: 'export function add(a: number, b: number) { return a + b; }',
    };

    const keywords = ['auth', 'session', 'token'];
    const score1 = scoreContentRelevance(file1.content, keywords, file1.name);
    const score2 = scoreContentRelevance(file2.content, keywords, file2.name);

    expect(score1).toBeGreaterThan(0.5);
    expect(score2).toBe(0);
  });

  it('ranks files accurately in descending order', () => {
    const files = [
      { name: 'irrelevant.ts', content: 'console.log("hello");' },
      { name: 'session.ts', content: 'class SessionManager { checkAuth() {} }' },
      { name: 'database.ts', content: 'connectDatabase();' },
    ];

    const ranked = rankFiles(files, 'check auth session');
    expect(ranked[0].name).toBe('session.ts');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
