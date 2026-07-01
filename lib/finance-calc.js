// Pure calculation functions for the MVH Finance module.
// No Airtable dependency, no side effects — safe to unit test in isolation.
// Rules implemented here come from MVH Financial Model and Billing
// Methodology v1.0 and the Finance Module Spec v1 (Sections 3, 6, 8, 26).

// VAT rate in Israel as of Jan 2025 is 18%. This is set by government order
// and can change — re-verify before relying on this default in production.
export const DEFAULT_VAT_RATE = 0.18

// Minimum allowed participant price per the v1.0 methodology (Section 6).
export const MINIMUM_TOUR_PRICE = 55

// Preset credit percentages — no custom percentages in v1 (Section: Available
// Credit Values).
export const CREDIT_PERCENTAGE_PRESETS = [5, 10, 25, 50, 75, 100]

// Rounds to 2 decimal places using standard financial rounding
// (half away from zero), matching "no rounding adjustments beyond standard
// financial precision" from the methodology doc.
export function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

// Returns the number of days in the given month.
// month is 1-indexed (1 = January) to match how dates are usually read/entered.
export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

// Number of active days within a single calendar month, counting the
// activation date itself as day 1. Matches the doc's example:
// activated 21 June -> active days in June = 10 (21st through 30th).
export function activeDaysInMonth(activationDate, year, month) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  const activation = new Date(activationDate)

  if (activation > end) return 0
  const effectiveStart = activation > start ? activation : start
  const diffMs = end - effectiveStart
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
}

// First-month proration per Section 8:
// Tour Price x Active Days During First Month / Days In Month
export function calculateProration(tourPrice, activationDate) {
  const activation = new Date(activationDate)
  const year = activation.getFullYear()
  const month = activation.getMonth() + 1 // back to 1-indexed
  const totalDays = daysInMonth(year, month)
  const activeDays = activeDaysInMonth(activationDate, year, month)
  const amount = roundCurrency((tourPrice * activeDays) / totalDays)

  return {
    activeDays,
    totalDaysInMonth: totalDays,
    amount
  }
}

// Applies a percentage-based Benefit/discount to a tour price.
// MVH does not support fixed-amount discounts — percentage only (Section 6).
export function applyBenefit(tourPrice, discountPercentage) {
  const pct = Math.max(0, Math.min(100, discountPercentage || 0))
  return roundCurrency(tourPrice * (1 - pct / 100))
}

// VAT amount on a given pre-VAT amount.
export function calculateVAT(amount, vatRate) {
  const rate = typeof vatRate === 'number' ? vatRate : DEFAULT_VAT_RATE
  return roundCurrency(amount * rate)
}

// Pre-VAT amount plus VAT.
export function calculateTotalWithVAT(amount, vatRate) {
  return roundCurrency(amount + calculateVAT(amount, vatRate))
}

// Builds the pre-VAT invoice total for a guide's first billing cycle,
// combining a prorated partial first month with a full second month.
// Matches the doc's worked example:
// 80 x 10/30 = 26.67, plus 80.00 full month = 106.67
export function calculateFirstMonthInvoiceLine(tourPrice, activationDate) {
  const proration = calculateProration(tourPrice, activationDate)
  const fullMonth = roundCurrency(tourPrice)
  const total = roundCurrency(proration.amount + fullMonth)

  return {
    prorationAmount: proration.amount,
    fullMonthAmount: fullMonth,
    total
  }
}

// Sums an array of billable line-item amounts (already benefit-applied,
// pre-VAT) into a pre-VAT invoice total.
export function sumInvoiceLines(amounts) {
  return roundCurrency(
    (amounts || []).reduce((sum, amount) => sum + (Number(amount) || 0), 0)
  )
}

// Full invoice total including VAT, given an array of pre-VAT line amounts.
export function calculateInvoiceTotal(amounts, vatRate) {
  const preVat = sumInvoiceLines(amounts)
  const vat = calculateVAT(preVat, vatRate)
  return {
    preVatAmount: preVat,
    vatAmount: vat,
    totalAmount: roundCurrency(preVat + vat)
  }
}

// Credit amount for a given invoice amount and preset percentage.
// Percentage must be one of CREDIT_PERCENTAGE_PRESETS (Section: Available
// Credit Values) — validation of the preset itself happens at the API layer.
export function calculateCreditAmount(invoiceAmount, creditPercentage) {
  return roundCurrency(invoiceAmount * (creditPercentage / 100))
}
