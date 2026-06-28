const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

/** Formats a number as a currency string for the overview tables. */
export function money(value: number): string {
  return currency.format(value);
}
