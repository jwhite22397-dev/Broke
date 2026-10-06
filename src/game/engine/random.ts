export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  private next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  random(): number {
    return this.next();
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  boolean(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(array: readonly T[]): T {
    if (array.length === 0) throw new Error('Cannot pick from empty array');
    return array[Math.floor(this.next() * array.length)]!;
  }

  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    if (items.length !== weights.length) throw new Error('Items and weights must have same length');
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]!;
      if (random <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }

  normal(mean = 0, stdDev = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }
}

export function generateSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}
