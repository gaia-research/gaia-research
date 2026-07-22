/**
 * lib/craft/prompt.test.ts
 *
 * Unit tests for prompt building & dynamic vocabulary injection (lib/craft/prompt.ts).
 */

import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildFusionPrompt,
  KNOWN_SKILL_VOCABULARY,
  denylistInstruction,
} from './prompt';

describe('buildSystemPrompt', () => {
  it('includes CONVERGENCE GRAVITY section', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('CONVERGENCE GRAVITY (Attractor System):');
  });

  it('uses default KNOWN_SKILL_VOCABULARY when dynamicVocabulary is omitted or empty', () => {
    const promptDefault = buildSystemPrompt();
    const promptEmpty = buildSystemPrompt([]);

    expect(promptDefault).toContain(KNOWN_SKILL_VOCABULARY.join(', '));
    expect(promptEmpty).toContain(KNOWN_SKILL_VOCABULARY.join(', '));
  });

  it('injects dynamic vocabulary when provided', () => {
    const customVocab = ['custom-scrape', 'custom-deploy', 'hyper-orchestrate'];
    const prompt = buildSystemPrompt(customVocab);

    expect(prompt).toContain('custom-scrape, custom-deploy, hyper-orchestrate');
    expect(prompt).not.toContain(KNOWN_SKILL_VOCABULARY[0]);
  });

  it('includes denylist tokens instruction', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain(denylistInstruction());
  });
});

describe('buildFusionPrompt', () => {
  it('builds valid ChatMessage array for skill pair', () => {
    const messages = buildFusionPrompt('/api-call', '/chain-of-thought');

    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[0].role).toBe('system');
    expect(messages[messages.length - 1].role).toBe('user');
    expect(messages[messages.length - 1].content).toBe('Fuse /api-call + /chain-of-thought');
  });

  it('passes dynamic vocabulary to system prompt', () => {
    const customVocab = ['dynamic-skill-alpha', 'dynamic-skill-beta'];
    const messages = buildFusionPrompt('api', 'code', customVocab);

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('dynamic-skill-alpha, dynamic-skill-beta');
  });
});
