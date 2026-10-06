import { describe, it, expect } from 'vitest';
import { 
  calculateLoanPayment, 
  processLoanPayment,
  calculateAnnualTaxes,
  updateCreditScore,
} from '../game/simulation/financialSystem';
import type { Loan, GameState } from '../game/models/types';

describe('calculateLoanPayment', () => {
  it('should calculate correct payment for standard loan', () => {
    const payment = calculateLoanPayment(20000, 0.06, 60);
    expect(payment).toBeGreaterThan(380);
    expect(payment).toBeLessThan(400);
  });

  it('should handle zero interest', () => {
    const payment = calculateLoanPayment(12000, 0, 12);
    expect(payment).toBe(1000);
  });

  it('should return higher payments for higher interest', () => {
    const lowInterest = calculateLoanPayment(10000, 0.05, 36);
    const highInterest = calculateLoanPayment(10000, 0.15, 36);
    expect(highInterest).toBeGreaterThan(lowInterest);
  });
});

describe('processLoanPayment', () => {
  it('should reduce balance correctly', () => {
    const loan: Loan = {
      id: 'test',
      type: 'personal',
      principal: 10000,
      balance: 10000,
      apr: 0.12,
      minimumPayment: 300,
      monthlyPayment: 300,
      termMonths: 36,
      remainingMonths: 36,
    };

    const { newBalance, interestPaid, principalPaid } = processLoanPayment(loan);
    
    expect(interestPaid).toBeCloseTo(100, 0);
    expect(principalPaid).toBeCloseTo(200, 0);
    expect(newBalance).toBeCloseTo(9800, 0);
  });

  it('should not go below zero', () => {
    const loan: Loan = {
      id: 'test',
      type: 'personal',
      principal: 100,
      balance: 50,
      apr: 0.05,
      minimumPayment: 100,
      monthlyPayment: 100,
      termMonths: 1,
      remainingMonths: 1,
    };

    const { newBalance } = processLoanPayment(loan);
    expect(newBalance).toBe(0);
  });
});

describe('calculateAnnualTaxes', () => {
  it('should calculate taxes for low income', () => {
    const taxes = calculateAnnualTaxes(30000, 0.05);
    expect(taxes).toBeGreaterThan(3000);
    expect(taxes).toBeLessThan(8000);
  });

  it('should calculate higher taxes for higher income', () => {
    const lowTax = calculateAnnualTaxes(50000, 0.05);
    const highTax = calculateAnnualTaxes(150000, 0.05);
    expect(highTax).toBeGreaterThan(lowTax * 2);
  });

  it('should include state tax', () => {
    const noStateTax = calculateAnnualTaxes(100000, 0);
    const withStateTax = calculateAnnualTaxes(100000, 0.08);
    expect(withStateTax).toBeGreaterThan(noStateTax);
  });
});

describe('updateCreditScore', () => {
  it('should increase score for on-time payments', () => {
    const mockState = {
      creditScore: 650,
      creditHistory: 12,
      missedPayments: 0,
      loans: [],
      monthlyIncome: 5000,
    } as unknown as GameState;

    const newScore = updateCreditScore(mockState, true, 0);
    expect(newScore).toBeGreaterThan(650);
  });

  it('should decrease score for missed payments', () => {
    const mockState = {
      creditScore: 700,
      creditHistory: 12,
      missedPayments: 0,
      loans: [],
      monthlyIncome: 5000,
    } as unknown as GameState;

    const newScore = updateCreditScore(mockState, false, 0);
    expect(newScore).toBeLessThan(700);
  });

  it('should not exceed 850', () => {
    const mockState = {
      creditScore: 845,
      creditHistory: 120,
      missedPayments: 0,
      loans: [],
      monthlyIncome: 10000,
    } as unknown as GameState;

    const newScore = updateCreditScore(mockState, true, 0);
    expect(newScore).toBeLessThanOrEqual(850);
  });

  it('should not go below 300', () => {
    const mockState = {
      creditScore: 310,
      creditHistory: 6,
      missedPayments: 10,
      loans: [{ balance: 50000 }],
      monthlyIncome: 2000,
    } as unknown as GameState;

    const newScore = updateCreditScore(mockState, false, 10000);
    expect(newScore).toBeGreaterThanOrEqual(300);
  });
});
