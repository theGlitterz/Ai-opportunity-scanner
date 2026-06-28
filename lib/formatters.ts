export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1);
    return `€${formatted}M`;
  }

  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${Math.round(value)}`;
}

export function formatCompactCurrencyRange(low: number, high: number): string {
  return `${formatCompactCurrency(low)}–${formatCompactCurrency(high)}`;
}
