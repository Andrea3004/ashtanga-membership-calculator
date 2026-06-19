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

export function formatWonFloor(amount: number) {
  if (isNaN(amount) || !isFinite(amount)) return "0원";
  return Math.floor(amount).toLocaleString("ko-KR") + "원";
}

export function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized ? Number(normalized) : 0;
}

export function addDaysToDateString(dateStr: string, days: number) {
  const date = parseLocalDate(dateStr);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
