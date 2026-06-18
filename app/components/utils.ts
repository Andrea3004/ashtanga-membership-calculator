export function parseLocalDate(dateStr: string | undefined) {
  if (!dateStr) return null;
  // Ensure local midnight
  return new Date(dateStr + "T00:00:00");
}

export function daysBetweenInclusive(start: Date, end: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.floor((e - s) / msPerDay) + 1;
}

export function daysBetweenExclusive(start: Date, end: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.floor((e - s) / msPerDay);
}

export function formatWon(amount: number) {
  if (isNaN(amount) || !isFinite(amount)) return "0원";
  const v = Math.round(amount);
  return v.toLocaleString("ko-KR") + "원";
}
