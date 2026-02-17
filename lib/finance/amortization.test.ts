import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAmortizationSchedule,
  calculateFinanceSummary,
  calculateLoanPrincipal,
  calculateMonthlyPayment,
} from "./amortization.js";

function assertApproximate(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test("calculateLoanPrincipal applies price, down payment, trade-in, and fees", () => {
  const principal = calculateLoanPrincipal({
    price: 40_000,
    downPaymentAmount: 4_000,
    tradeInValue: 5_000,
    fees: 1_000,
  });

  assert.equal(principal, 32_000);
});

test("calculateMonthlyPayment returns principal divided by term for 0 APR", () => {
  const payment = calculateMonthlyPayment(25_000, 0, 60);
  assertApproximate(payment, 416.6667, 0.0001);
});

test("calculateMonthlyPayment matches amortization formula for positive APR", () => {
  const payment = calculateMonthlyPayment(10_000, 12, 12);
  assertApproximate(payment, 888.4879, 0.0001);
});

test("calculateFinanceSummary handles tiny principal and remains stable", () => {
  const summary = calculateFinanceSummary({
    price: 1,
    downPaymentValue: 0,
    downPaymentMode: "amount",
    termMonths: 72,
    aprPercent: 5,
  });

  assert.equal(summary.isValid, true);
  assert.ok(summary.monthlyPayment > 0);
  assert.ok(Number.isFinite(summary.monthlyPayment));
  assert.equal(summary.schedule.length, 12);
});

test("calculateFinanceSummary handles large terms and limits schedule preview", () => {
  const summary = calculateFinanceSummary({
    price: 85_000,
    downPaymentValue: 15,
    downPaymentMode: "percent",
    tradeInValue: 10_000,
    fees: 2_000,
    termMonths: 480,
    aprPercent: 7.2,
  });

  assert.equal(summary.isValid, true);
  assert.equal(summary.schedule.length, 12);
  assert.ok(summary.totalPaid > summary.principal);
  assert.ok(summary.totalInterest > 0);
});

test("buildAmortizationSchedule can generate full term rows", () => {
  const schedule = buildAmortizationSchedule({
    principal: 12_000,
    aprPercent: 0,
    termMonths: 12,
    monthsToGenerate: 12,
  });

  assert.equal(schedule.length, 12);
  assert.equal(schedule[0]?.month, 1);
  assert.equal(schedule[11]?.remainingBalance, 0);
});

test("calculateFinanceSummary returns validation errors for invalid values", () => {
  const summary = calculateFinanceSummary({
    price: 30_000,
    downPaymentValue: 10,
    downPaymentMode: "amount",
    termMonths: 0,
    aprPercent: -2,
  });

  assert.equal(summary.isValid, false);
  assert.ok(summary.errors.includes("INVALID_APR"));
  assert.ok(summary.errors.includes("INVALID_TERM"));
  assert.ok(!summary.errors.includes("INVALID_PRINCIPAL"));
  assert.equal(summary.monthlyPayment, 0);
});
