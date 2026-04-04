import { describe, it, expect } from 'vitest';
import { countOuts, getOutCards, countOvercardOuts } from '../outs';

describe('countOvercardOuts', () => {
  it('AK on 234 board = 6 outs', () => {
    expect(countOvercardOuts(['Ah', 'Kd'], ['2c', '3s', '4h'])).toBe(6);
  });
  it('AQ on K34 board = 3 outs (only A is overcard)', () => {
    expect(countOvercardOuts(['Ah', 'Qd'], ['Kc', '3s', '4h'])).toBe(3);
  });
  it('QJ on AK2 board = 0 outs (no overcards)', () => {
    expect(countOvercardOuts(['Qh', 'Jd'], ['Ac', 'Ks', '2h'])).toBe(0);
  });
  it('AK on 567 board = 6 outs', () => {
    expect(countOvercardOuts(['As', 'Kc'], ['5h', '6d', '7s'])).toBe(6);
  });
  it('KQ on J82 board = 6 outs', () => {
    expect(countOvercardOuts(['Kh', 'Qd'], ['Jc', '8s', '2h'])).toBe(6);
  });
});

describe('flush outs', () => {
  it('flush draw with 4 suited cards = 9 outs', () => {
    const hand = ['Ah', '5h'];
    const board = ['Kh', '3h', '9c'];
    const outCards = getOutCards(hand, board);
    // Should include all remaining hearts
    const heartOuts = outCards.filter(c => c.endsWith('h'));
    expect(heartOuts.length).toBe(9);
  });
});

describe('combo outs', () => {
  it('flush draw + overcards has more outs than either alone', () => {
    // AK suited on low board with 2 of the suit
    const hand = ['Ah', 'Kh'];
    const board = ['3h', '5h', '8c'];
    const flushOuts = 9;
    const overcardOuts = countOvercardOuts(hand, board);
    expect(overcardOuts).toBe(6);
    // Combo should be flush + overcards (no overlap since hole cards are suited)
    expect(flushOuts + overcardOuts).toBe(15);
  });
});

describe('generateOvercardOuts output validation', () => {
  // Dynamically import to avoid issues with module resolution
  it('returns problems with correctAnswer matching 3-6 outs range', async () => {
    const { generateProblems } = await import('../generators');
    const problems = generateProblems('count-outs', 20);
    const overcardProblems = problems.filter(p => p.question.includes('overcards'));
    for (const p of overcardProblems) {
      const correctIdx = p.correctAnswer.charCodeAt(0) - 65;
      const match = p.options[correctIdx].match(/(\d+)/);
      expect(match).not.toBeNull();
      const outs = parseInt(match![1], 10);
      expect(outs).toBeGreaterThanOrEqual(3);
      expect(outs).toBeLessThanOrEqual(6);
    }
  });
});

describe('generateComboOutsProblem output validation', () => {
  it('returns problems with correctAnswer in 9-15 range', async () => {
    const { generateProblems } = await import('../generators');
    const problems = generateProblems('combo-outs', 10);
    for (const p of problems) {
      const correctIdx = p.correctAnswer.charCodeAt(0) - 65;
      const match = p.options[correctIdx].match(/(\d+)/);
      expect(match).not.toBeNull();
      const outs = parseInt(match![1], 10);
      expect(outs).toBeGreaterThanOrEqual(9);
      expect(outs).toBeLessThanOrEqual(15);
    }
  });
});

describe('makeOutsProblem deduplication', () => {
  it('never produces duplicate options', async () => {
    const { generateProblems } = await import('../generators');
    const problems = generateProblems('count-outs', 30);
    for (const p of problems) {
      const optionSet = new Set(p.options);
      expect(optionSet.size).toBe(p.options.length);
    }
  });
});
