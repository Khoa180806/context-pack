import { describe, it, expect } from 'vitest';
import { extractKeywords, scoreFileRelevance, rankFiles } from '../src/ranker.js';

describe('extractKeywords', () => {
  it('extracts unique lowercase keywords and removes stop words', () => {
    const task = 'Fix the authentication bug in UserService and the login handler';
    const keywords = extractKeywords(task);
    expect(keywords).toContain('authentication');
    expect(keywords).toContain('bug');
    expect(keywords).toContain('userservice');
    expect(keywords).toContain('login');
    expect(keywords).toContain('handler');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('in');
    expect(keywords).not.toContain('and');
  });

  it('handles empty task or only stop words gracefully', () => {
    expect(extractKeywords('')).toEqual([]);
    expect(extractKeywords('in the and of')).toEqual([]);
  });

  it('expands Vietnamese prompts with technical synonyms into English keywords', () => {
    const taskViWithAccents = 'Sửa lỗi đăng nhập và xác thực tài khoản';
    const keywords = extractKeywords(taskViWithAccents);

    // Should include expanded English synonyms
    expect(keywords).toContain('login');
    expect(keywords).toContain('auth');
    expect(keywords).toContain('account');
    expect(keywords).toContain('fix');
    // Stop words should be removed
    expect(keywords).not.toContain('va');
  });

  it('treats Vietnamese with accents and without accents identically', () => {
    const withAccents = extractKeywords('dang nhap');
    const withoutAccents = extractKeywords('đăng nhập');
    expect(withAccents).toEqual(withoutAccents);
  });
});

describe('scoreFileRelevance', () => {
  const content = `
    import { User } from './models';
    export class UserService {
      async login(credentials: any) {
        // authentication logic
        return true;
      }
    }
  `;

  it('scores higher when file contains more matching keywords', () => {
    const keywordsHigh = ['userservice', 'login', 'authentication'];
    const keywordsLow = ['logger', 'database'];

    const scoreHigh = scoreFileRelevance(content, keywordsHigh);
    const scoreLow = scoreFileRelevance(content, keywordsLow);

    expect(scoreHigh).toBeGreaterThan(0.5);
    expect(scoreLow).toBe(0);
  });

  it('returns a normalized score between 0.0 and 1.0', () => {
    const keywords = ['userservice', 'login', 'authentication', 'missing'];
    const score = scoreFileRelevance(content, keywords);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns default fallback score when keywords array is empty', () => {
    const score = scoreFileRelevance(content, []);
    expect(score).toBe(0.5);
  });
});

describe('rankFiles', () => {
  const files = [
    {
      file: 'src/utils/logger.ts',
      content: 'export const log = (msg: string) => console.log(msg);',
    },
    {
      file: 'src/services/UserService.ts',
      content: 'export class UserService { login() { return true; } }',
    },
    {
      file: 'src/auth/handler.ts',
      content: 'import { Config } from "../config"; // misc auth handler',
    },
  ];

  it('ranks files by relevance score descending', () => {
    const task = 'UserService login authentication';
    const ranked = rankFiles(files, task);

    expect(ranked.length).toBe(3);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
    expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score);
    expect(ranked[0].file).toBe('src/services/UserService.ts');
  });

  it('ranks English code files accurately from pure Vietnamese task prompt', () => {
    const taskVi = 'Sửa lỗi đăng nhập người dùng';
    const ranked = rankFiles(files, taskVi);

    // UserService with login() must be ranked #1 even though the prompt was pure Vietnamese
    expect(ranked[0].file).toBe('src/services/UserService.ts');
    expect(ranked[0].score).toBeGreaterThan(ranked[2].score);
  });

  it('filters out files below minRelevance', () => {
    const task = 'UserService login';
    const ranked = rankFiles(files, task, 0.5);
    for (const item of ranked) {
      expect(item.score).toBeGreaterThanOrEqual(0.5);
    }
  });
});
