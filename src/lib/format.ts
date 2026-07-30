export const TAX_RATES = [0, 5, 19] as const;

export type TaxRate = (typeof TAX_RATES)[number];

export function formatCOP(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTaxRate(rate: number) {
  return `${rate}%`;
}
