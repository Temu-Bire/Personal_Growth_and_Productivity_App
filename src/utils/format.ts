export function formatCurrency(amount: number, currency = '$'): string {
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const formattedAbs = Math.abs(amount).toFixed(2);
  if (isPositive) return `+${currency}${formattedAbs}`;
  if (isNegative) return `-${currency}${formattedAbs}`;
  return `${currency}${formattedAbs}`;
}

export function formatPercent(value: number, decimals = 0): string {
  const safeVal = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
  return `${safeVal.toFixed(decimals)}%`;
}

export function formatDurationSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function formatMinutesToHours(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hrs === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hrs}h`;
  return `${hrs}h ${remainingMins}m`;
}
