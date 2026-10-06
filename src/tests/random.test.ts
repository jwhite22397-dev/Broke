import { describe, it, expect } from 'vitest';
import { SeededRandom, generateSeed } from '../game/engine/random';

describe('SeededRandom', () => {
  it('should produce deterministic results with the same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);
    
    expect(rng1.random()).toBe(rng2.random());
    expect(rng1.random()).toBe(rng2.random());
    expect(rng1.random()).toBe(rng2.random());
  });

  it('should produce different results with different seeds', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(54321);
    
    expect(rng1.random()).not.toBe(rng2.random());
  });

  it('should generate numbers in range', () => {
    const rng = new SeededRandom(12345);
    
    for (let i = 0; i < 100; i++) {
      const num = rng.range(10, 20);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(20);
    }
  });

  it('should generate floats in range', () => {
    const rng = new SeededRandom(12345);
    
    for (let i = 0; i < 100; i++) {
      const num = rng.float(0, 1);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    }
  });

  it('should pick from array deterministically', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);
    const items = ['a', 'b', 'c', 'd', 'e'];
    
    expect(rng1.pick(items)).toBe(rng2.pick(items));
  });

  it('should shuffle array', () => {
    const rng = new SeededRandom(12345);
    const original = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...original]);
    
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should generate weighted picks', () => {
    const rng = new SeededRandom(12345);
    const items = ['common', 'rare'];
    const weights = [90, 10];
    
    let commonCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (rng.pickWeighted(items, weights) === 'common') {
        commonCount++;
      }
    }
    
    expect(commonCount).toBeGreaterThan(800);
  });
});

describe('generateSeed', () => {
  it('should generate different seeds', () => {
    const seeds = new Set<number>();
    for (let i = 0; i < 100; i++) {
      seeds.add(generateSeed());
    }
    expect(seeds.size).toBeGreaterThan(90);
  });
});
