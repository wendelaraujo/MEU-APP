export function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyWithoutPrefix(value: number): string {
  const absValue = Math.abs(value);
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);
}

export function parseCurrencyInput(value: string): number {
  // Cleans "1.840,50" or "R$ 1.840,50" to float number
  const clean = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDateBR(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayFormatted = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return `${dayFormatted} ${monthNames[date.getMonth()]}`;
  } catch {
    return dateStr;
  }
}
