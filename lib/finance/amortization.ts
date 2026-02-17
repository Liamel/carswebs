export type DownPaymentMode = "amount" | "percent";

export type FinanceValidationError =
  | "INVALID_PRICE"
  | "INVALID_DOWN_PAYMENT"
  | "INVALID_TRADE_IN"
  | "INVALID_FEES"
  | "INVALID_APR"
  | "INVALID_TERM"
  | "INVALID_PRINCIPAL";

export type CalculateFinanceSummaryInput = {
  price: number;
  downPaymentValue: number;
  downPaymentMode: DownPaymentMode;
  termMonths: number;
  aprPercent: number;
  tradeInValue?: number;
  fees?: number;
  scheduleMonths?: number;
};

export type AmortizationScheduleEntry = {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
};

export type FinanceCalculationResult = {
  isValid: boolean;
  errors: FinanceValidationError[];
  principal: number;
  downPaymentAmount: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  monthlyRate: number;
  schedule: AmortizationScheduleEntry[];
};

const MONTHS_IN_YEAR = 12;
const PERCENT_DIVISOR = 100;

function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * PERCENT_DIVISOR) / PERCENT_DIVISOR;
}

function isValidFiniteNumber(value: number) {
  return Number.isFinite(value);
}

function normalizeTermMonths(value: number) {
  return Math.trunc(value);
}

function pushUniqueError(errors: FinanceValidationError[], code: FinanceValidationError) {
  if (!errors.includes(code)) {
    errors.push(code);
  }
}

export function toMonthlyRate(aprPercent: number) {
  return aprPercent / PERCENT_DIVISOR / MONTHS_IN_YEAR;
}

export function resolveDownPaymentAmount(price: number, downPaymentValue: number, mode: DownPaymentMode) {
  if (mode === "percent") {
    return (price * downPaymentValue) / PERCENT_DIVISOR;
  }

  return downPaymentValue;
}

export function calculateLoanPrincipal({
  price,
  downPaymentAmount,
  tradeInValue = 0,
  fees = 0,
}: {
  price: number;
  downPaymentAmount: number;
  tradeInValue?: number;
  fees?: number;
}) {
  return price - downPaymentAmount - tradeInValue + fees;
}

export function calculateMonthlyPayment(principal: number, aprPercent: number, termMonths: number) {
  if (
    !isValidFiniteNumber(principal) ||
    !isValidFiniteNumber(aprPercent) ||
    !isValidFiniteNumber(termMonths) ||
    principal <= 0 ||
    aprPercent < 0 ||
    termMonths <= 0
  ) {
    return 0;
  }

  const monthlyRate = toMonthlyRate(aprPercent);

  if (Math.abs(monthlyRate) < Number.EPSILON) {
    return principal / termMonths;
  }

  const compoundedRate = Math.pow(1 + monthlyRate, termMonths);
  const denominator = compoundedRate - 1;

  if (Math.abs(denominator) < Number.EPSILON) {
    return principal / termMonths;
  }

  return principal * ((monthlyRate * compoundedRate) / denominator);
}

export function buildAmortizationSchedule({
  principal,
  aprPercent,
  termMonths,
  monthsToGenerate,
  monthlyPayment,
}: {
  principal: number;
  aprPercent: number;
  termMonths: number;
  monthsToGenerate?: number;
  monthlyPayment?: number;
}) {
  const normalizedTerm = normalizeTermMonths(termMonths);
  const normalizedMonthsToGenerate = normalizeTermMonths(monthsToGenerate ?? normalizedTerm);

  if (
    !isValidFiniteNumber(principal) ||
    !isValidFiniteNumber(aprPercent) ||
    !isValidFiniteNumber(normalizedTerm) ||
    principal <= 0 ||
    aprPercent < 0 ||
    normalizedTerm <= 0 ||
    normalizedMonthsToGenerate <= 0
  ) {
    return [] satisfies AmortizationScheduleEntry[];
  }

  const resolvedMonthlyPayment =
    typeof monthlyPayment === "number" && isValidFiniteNumber(monthlyPayment) && monthlyPayment > 0
      ? monthlyPayment
      : calculateMonthlyPayment(principal, aprPercent, normalizedTerm);

  if (resolvedMonthlyPayment <= 0) {
    return [] satisfies AmortizationScheduleEntry[];
  }

  const monthlyRate = toMonthlyRate(aprPercent);
  const scheduleLength = Math.min(normalizedTerm, normalizedMonthsToGenerate);
  const schedule: AmortizationScheduleEntry[] = [];
  let remainingBalance = principal;

  for (let month = 1; month <= scheduleLength; month += 1) {
    const interestPaid = monthlyRate > 0 ? remainingBalance * monthlyRate : 0;
    let principalPaid = resolvedMonthlyPayment - interestPaid;

    if (principalPaid > remainingBalance || month === normalizedTerm) {
      principalPaid = remainingBalance;
    }

    if (principalPaid < 0) {
      principalPaid = 0;
    }

    remainingBalance = Math.max(0, remainingBalance - principalPaid);

    schedule.push({
      month,
      payment: roundToCents(resolvedMonthlyPayment),
      principalPaid: roundToCents(principalPaid),
      interestPaid: roundToCents(interestPaid),
      remainingBalance: roundToCents(remainingBalance),
    });

    if (remainingBalance <= 0) {
      break;
    }
  }

  return schedule;
}

export function calculateFinanceSummary(input: CalculateFinanceSummaryInput): FinanceCalculationResult {
  const errors: FinanceValidationError[] = [];
  const tradeInValue = input.tradeInValue ?? 0;
  const fees = input.fees ?? 0;
  const normalizedTerm = normalizeTermMonths(input.termMonths);

  if (!isValidFiniteNumber(input.price) || input.price < 0) {
    pushUniqueError(errors, "INVALID_PRICE");
  }

  if (!isValidFiniteNumber(input.downPaymentValue) || input.downPaymentValue < 0) {
    pushUniqueError(errors, "INVALID_DOWN_PAYMENT");
  }

  if (input.downPaymentMode === "percent" && input.downPaymentValue > 100) {
    pushUniqueError(errors, "INVALID_DOWN_PAYMENT");
  }

  if (!isValidFiniteNumber(tradeInValue) || tradeInValue < 0) {
    pushUniqueError(errors, "INVALID_TRADE_IN");
  }

  if (!isValidFiniteNumber(fees) || fees < 0) {
    pushUniqueError(errors, "INVALID_FEES");
  }

  if (!isValidFiniteNumber(input.aprPercent) || input.aprPercent < 0) {
    pushUniqueError(errors, "INVALID_APR");
  }

  if (!isValidFiniteNumber(normalizedTerm) || normalizedTerm <= 0) {
    pushUniqueError(errors, "INVALID_TERM");
  }

  const downPaymentAmount = resolveDownPaymentAmount(
    isValidFiniteNumber(input.price) ? input.price : 0,
    isValidFiniteNumber(input.downPaymentValue) ? input.downPaymentValue : 0,
    input.downPaymentMode,
  );

  const principal = calculateLoanPrincipal({
    price: isValidFiniteNumber(input.price) ? input.price : 0,
    downPaymentAmount: isValidFiniteNumber(downPaymentAmount) ? downPaymentAmount : 0,
    tradeInValue: isValidFiniteNumber(tradeInValue) ? tradeInValue : 0,
    fees: isValidFiniteNumber(fees) ? fees : 0,
  });

  if (!isValidFiniteNumber(principal) || principal <= 0) {
    pushUniqueError(errors, "INVALID_PRINCIPAL");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      principal: isValidFiniteNumber(principal) ? roundToCents(principal) : 0,
      downPaymentAmount: isValidFiniteNumber(downPaymentAmount) ? roundToCents(downPaymentAmount) : 0,
      monthlyPayment: 0,
      totalPaid: 0,
      totalInterest: 0,
      monthlyRate: 0,
      schedule: [],
    };
  }

  const monthlyRate = toMonthlyRate(input.aprPercent);
  const rawMonthlyPayment = calculateMonthlyPayment(principal, input.aprPercent, normalizedTerm);
  const totalPaid = rawMonthlyPayment * normalizedTerm;
  const totalInterest = totalPaid - principal;
  const schedule = buildAmortizationSchedule({
    principal,
    aprPercent: input.aprPercent,
    termMonths: normalizedTerm,
    monthsToGenerate: input.scheduleMonths ?? 12,
    monthlyPayment: rawMonthlyPayment,
  });

  return {
    isValid: true,
    errors: [],
    principal: roundToCents(principal),
    downPaymentAmount: roundToCents(downPaymentAmount),
    monthlyPayment: roundToCents(rawMonthlyPayment),
    totalPaid: roundToCents(totalPaid),
    totalInterest: roundToCents(totalInterest),
    monthlyRate,
    schedule,
  };
}
