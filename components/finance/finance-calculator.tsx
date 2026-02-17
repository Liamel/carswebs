"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateFinanceSummary, type DownPaymentMode, type FinanceValidationError } from "@/lib/finance/amortization";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const DEFAULT_TERM_OPTIONS = [12, 24, 36, 48, 60, 72];
const PRICE_SLIDER_STEP = 100;
const PERCENT_SLIDER_STEP = 0.5;
const MAX_CAR_PRICE = 200_000;

const INTL_LOCALE_BY_LOCALE: Record<Locale, string> = {
  geo: "ka-GE",
  en: "en-US",
  ru: "ru-RU",
};

export type FinanceCalculatorMode = "full" | "compact";

export type FinanceCalculatorLabels = {
  title: string;
  subtitle?: string;
  expandAriaLabel: string;
  collapseAriaLabel: string;
  vehiclePriceLabel: string;
  downPaymentLabel: string;
  downPaymentModeAmount: string;
  downPaymentModePercent: string;
  loanTermLabel: string;
  aprLabel: string;
  advancedToggleShow: string;
  advancedToggleHide: string;
  tradeInLabel: string;
  feesLabel: string;
  monthlyPaymentLabel: string;
  loanPrincipalLabel: string;
  totalPaidLabel: string;
  totalInterestLabel: string;
  validationSummaryLabel: string;
  validationPrincipalPositive: string;
  validationAprNonNegative: string;
  validationTermPositive: string;
  amortizationTitle: string;
  amortizationDescription: string;
  monthLabel: string;
  principalPaidLabel: string;
  interestPaidLabel: string;
  remainingBalanceLabel: string;
  termUnit: string;
};

export type FinanceCalculatorProps = {
  locale: Locale;
  labels: FinanceCalculatorLabels;
  defaultPrice: number;
  defaultAprPercent?: number;
  defaultTermMonths?: number;
  defaultDownPaymentValue?: number;
  defaultDownPaymentMode?: DownPaymentMode;
  defaultTradeInValue?: number;
  defaultFees?: number;
  termOptions?: number[];
  currency?: string;
  mode?: FinanceCalculatorMode;
  className?: string;
  defaultExpanded?: boolean;
  context?: {
    carName?: string;
    slug?: string;
  };
};

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function toNonNegativeNumber(value: string) {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function getUniqueValidationMessages({
  errors,
  labels,
}: {
  errors: FinanceValidationError[];
  labels: Pick<
    FinanceCalculatorLabels,
    "validationPrincipalPositive" | "validationAprNonNegative" | "validationTermPositive"
  >;
}) {
  const messages = new Set<string>();

  for (const error of errors) {
    if (error === "INVALID_APR") {
      messages.add(labels.validationAprNonNegative);
      continue;
    }

    if (error === "INVALID_TERM") {
      messages.add(labels.validationTermPositive);
      continue;
    }

    messages.add(labels.validationPrincipalPositive);
  }

  return Array.from(messages);
}

function buildCurrencyFormatter({
  locale,
  currency,
  maximumFractionDigits,
}: {
  locale: string;
  currency: string;
  maximumFractionDigits: number;
}) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });
  } catch {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });
  }
}

function ResultMetric({
  label,
  value,
  isHighlighted = false,
}: {
  label: string;
  value: string;
  isHighlighted?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-white/85 p-3", isHighlighted && "border-primary/30 bg-primary/5")}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", isHighlighted && "text-primary")}>{value}</p>
    </div>
  );
}

export function FinanceCalculator({
  locale,
  labels,
  defaultPrice,
  defaultAprPercent = 6.5,
  defaultTermMonths = 60,
  defaultDownPaymentValue = 10,
  defaultDownPaymentMode = "percent",
  defaultTradeInValue = 0,
  defaultFees = 0,
  termOptions,
  currency = "USD",
  mode = "full",
  className,
  defaultExpanded,
  context,
}: FinanceCalculatorProps) {
  const idBase = useId();
  const localeCode = INTL_LOCALE_BY_LOCALE[locale];
  const isCompact = mode === "compact";
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? isCompact);
  const normalizedTermOptions = useMemo(() => {
    const options = (termOptions?.length ? termOptions : DEFAULT_TERM_OPTIONS)
      .map((value) => Math.trunc(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    const normalizedOptions = [...new Set(options)].sort((left, right) => left - right);

    return normalizedOptions.length > 0 ? normalizedOptions : DEFAULT_TERM_OPTIONS;
  }, [termOptions]);
  const normalizedDefaultTerm = Math.trunc(defaultTermMonths);
  const [price, setPrice] = useState(() =>
    Math.min(MAX_CAR_PRICE, Math.max(0, roundToStep(defaultPrice, PRICE_SLIDER_STEP))),
  );
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>(defaultDownPaymentMode);
  const [downPaymentValue, setDownPaymentValue] = useState(() => Math.max(0, defaultDownPaymentValue));
  const [termMonths, setTermMonths] = useState(() =>
    normalizedTermOptions.includes(normalizedDefaultTerm) ? normalizedDefaultTerm : normalizedTermOptions[0] ?? DEFAULT_TERM_OPTIONS[0],
  );
  const [aprPercent, setAprPercent] = useState(() => Math.max(0, defaultAprPercent));
  const [tradeInValue, setTradeInValue] = useState(() => Math.max(0, defaultTradeInValue));
  const [fees, setFees] = useState(() => Math.max(0, defaultFees));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priceSliderMax = MAX_CAR_PRICE;
  const downPaymentAmountMax = Math.max(price, PRICE_SLIDER_STEP);
  const downPaymentSliderStep = downPaymentMode === "amount" ? PRICE_SLIDER_STEP : PERCENT_SLIDER_STEP;
  const downPaymentSliderMax = downPaymentMode === "amount" ? downPaymentAmountMax : 100;
  const normalizedDownPaymentValue = Math.min(downPaymentValue, downPaymentSliderMax);
  const moneyFormatter = useMemo(
    () => buildCurrencyFormatter({ locale: localeCode, currency, maximumFractionDigits: 2 }),
    [currency, localeCode],
  );
  const wholeCurrencyFormatter = useMemo(
    () => buildCurrencyFormatter({ locale: localeCode, currency, maximumFractionDigits: 0 }),
    [currency, localeCode],
  );
  const summary = useMemo(
    () =>
      calculateFinanceSummary({
        price,
        downPaymentMode,
        downPaymentValue: normalizedDownPaymentValue,
        termMonths,
        aprPercent,
        tradeInValue,
        fees,
        scheduleMonths: 12,
      }),
    [aprPercent, downPaymentMode, fees, normalizedDownPaymentValue, price, termMonths, tradeInValue],
  );
  const validationMessages = useMemo(
    () =>
      getUniqueValidationMessages({
        errors: summary.errors,
        labels,
      }),
    [labels, summary.errors],
  );
  const displayedDownPaymentValue =
    downPaymentMode === "amount"
      ? wholeCurrencyFormatter.format(normalizedDownPaymentValue)
      : `${new Intl.NumberFormat(localeCode, { maximumFractionDigits: 1 }).format(normalizedDownPaymentValue)}%`;
  const paymentDisplay = summary.isValid ? moneyFormatter.format(summary.monthlyPayment) : "—";
  const principalDisplay = summary.isValid ? moneyFormatter.format(summary.principal) : "—";
  const totalPaidDisplay = summary.isValid ? moneyFormatter.format(summary.totalPaid) : "—";
  const totalInterestDisplay = summary.isValid ? moneyFormatter.format(summary.totalInterest) : "—";
  const handlePriceChange = (nextPrice: number) => {
    const normalizedPrice = Math.min(MAX_CAR_PRICE, Math.max(0, roundToStep(nextPrice, PRICE_SLIDER_STEP)));

    setPrice(normalizedPrice);

    if (downPaymentMode === "amount") {
      setDownPaymentValue((currentValue) => Math.min(currentValue, normalizedPrice));
    }
  };
  const handleDownPaymentModeChange = (nextMode: DownPaymentMode) => {
    if (nextMode === downPaymentMode) {
      return;
    }

    setDownPaymentValue((currentValue) => {
      if (nextMode === "amount") {
        return Math.min(price, roundToStep((currentValue / 100) * price, PRICE_SLIDER_STEP));
      }

      if (price <= 0) {
        return 0;
      }

      return Math.min(100, roundToStep((currentValue / price) * 100, PERCENT_SLIDER_STEP));
    });
    setDownPaymentMode(nextMode);
  };

  return (
    <Card
      className={cn("bg-white/92", className)}
      data-finance-car-name={context?.carName}
      data-finance-context-slug={context?.slug}
    >
      <CardHeader className={cn(isCompact ? "pb-2" : "pb-3")}>
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 text-left"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          aria-expanded={isExpanded}
          aria-controls={`${idBase}-finance-content`}
        >
          <div>
            <CardTitle className={cn("font-display", isCompact ? "text-xl" : "text-2xl")}>{labels.title}</CardTitle>
            {labels.subtitle ? <CardDescription className="mt-1">{labels.subtitle}</CardDescription> : null}
          </div>
          <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-white">
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            <span className="sr-only">{isExpanded ? labels.collapseAriaLabel : labels.expandAriaLabel}</span>
          </span>
        </button>
      </CardHeader>
      {isExpanded ? (
        <CardContent id={`${idBase}-finance-content`} className={cn("space-y-5", isCompact && "space-y-4")}>
          <div className={cn("grid gap-4", !isCompact && "md:grid-cols-2 md:items-start")}>
            <div className="space-y-3 rounded-2xl border border-border/60 bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`${idBase}-price`}>{labels.vehiclePriceLabel}</Label>
                <span className="text-sm font-medium text-muted-foreground">{wholeCurrencyFormatter.format(price)}</span>
              </div>
              <Slider
                id={`${idBase}-price-slider`}
                min={0}
                max={priceSliderMax}
                step={PRICE_SLIDER_STEP}
                value={[price]}
                onValueChange={(nextValue) => handlePriceChange(nextValue[0] ?? 0)}
              />
              <Input
                id={`${idBase}-price`}
                type="number"
                min={0}
                max={MAX_CAR_PRICE}
                step={PRICE_SLIDER_STEP}
                value={price}
                onChange={(event) => handlePriceChange(toNonNegativeNumber(event.target.value))}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`${idBase}-down-payment`}>{labels.downPaymentLabel}</Label>
                <span className="min-w-20 text-right text-sm font-medium text-muted-foreground">{displayedDownPaymentValue}</span>
              </div>
              <Slider
                id={`${idBase}-down-payment-slider`}
                min={0}
                max={downPaymentSliderMax}
                step={downPaymentSliderStep}
                value={[normalizedDownPaymentValue]}
                onValueChange={(nextValue) => setDownPaymentValue(nextValue[0] ?? 0)}
              />
              <Input
                id={`${idBase}-down-payment`}
                type="number"
                min={0}
                max={downPaymentSliderMax}
                step={downPaymentSliderStep}
                value={normalizedDownPaymentValue}
                onChange={(event) =>
                  setDownPaymentValue(Math.min(toNonNegativeNumber(event.target.value), downPaymentSliderMax))
                }
              />
              <div className="grid grid-cols-2 rounded-xl border border-border/70 bg-muted/30 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={downPaymentMode === "amount" ? "default" : "ghost"}
                  className="h-8 rounded-lg text-xs"
                  onClick={() => handleDownPaymentModeChange("amount")}
                >
                  {labels.downPaymentModeAmount}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={downPaymentMode === "percent" ? "default" : "ghost"}
                  className="h-8 rounded-lg text-xs"
                  onClick={() => handleDownPaymentModeChange("percent")}
                >
                  {labels.downPaymentModePercent}
                </Button>
              </div>
            </div>
          </div>

          <div className={cn("grid gap-4", !isCompact && "md:grid-cols-2")}>
            <div className="space-y-2">
              <Label htmlFor={`${idBase}-term`}>{labels.loanTermLabel}</Label>
              <Select value={String(termMonths)} onValueChange={(value) => setTermMonths(Number.parseInt(value, 10))}>
                <SelectTrigger id={`${idBase}-term`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {normalizedTermOptions.map((months) => (
                    <SelectItem key={months} value={String(months)}>
                      {`${months} ${labels.termUnit}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${idBase}-apr`}>{labels.aprLabel}</Label>
              <Input
                id={`${idBase}-apr`}
                type="number"
                min={0}
                step={0.01}
                value={aprPercent}
                onChange={(event) => setAprPercent(toNonNegativeNumber(event.target.value))}
              />
            </div>
          </div>

          {!isCompact ? (
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                className="h-auto rounded-lg px-0 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => setShowAdvanced((currentValue) => !currentValue)}
              >
                {showAdvanced ? labels.advancedToggleHide : labels.advancedToggleShow}
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showAdvanced ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${idBase}-trade-in`}>{labels.tradeInLabel}</Label>
                    <Input
                      id={`${idBase}-trade-in`}
                      type="number"
                      min={0}
                      step={PRICE_SLIDER_STEP}
                      value={tradeInValue}
                      onChange={(event) => setTradeInValue(toNonNegativeNumber(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${idBase}-fees`}>{labels.feesLabel}</Label>
                    <Input
                      id={`${idBase}-fees`}
                      type="number"
                      min={0}
                      step={PRICE_SLIDER_STEP}
                      value={fees}
                      onChange={(event) => setFees(toNonNegativeNumber(event.target.value))}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {validationMessages.length > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              <p className="font-medium">{labels.validationSummaryLabel}</p>
              <ul className="mt-1 space-y-1">
                {validationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 md:grid-cols-2">
            <ResultMetric label={labels.monthlyPaymentLabel} value={paymentDisplay} isHighlighted />
            <ResultMetric label={labels.loanPrincipalLabel} value={principalDisplay} />
            <ResultMetric label={labels.totalPaidLabel} value={totalPaidDisplay} />
            <ResultMetric label={labels.totalInterestLabel} value={totalInterestDisplay} />
          </div>

          {!isCompact && summary.isValid && summary.schedule.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">{labels.amortizationTitle}</p>
                <p className="text-sm text-muted-foreground">{labels.amortizationDescription}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{labels.monthLabel}</TableHead>
                    <TableHead className="text-right">{labels.principalPaidLabel}</TableHead>
                    <TableHead className="text-right">{labels.interestPaidLabel}</TableHead>
                    <TableHead className="text-right">{labels.remainingBalanceLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.schedule.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell className="text-right">{moneyFormatter.format(row.principalPaid)}</TableCell>
                      <TableCell className="text-right">{moneyFormatter.format(row.interestPaid)}</TableCell>
                      <TableCell className="text-right">{moneyFormatter.format(row.remainingBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
