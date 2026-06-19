import { MembershipPeriod } from "./refundHistory";

export const CONVERSION_HISTORY_KEY = "conversion_history";

export type ConversionHistoryItem = {
  id: string;
  name: string;
  periodType: MembershipPeriod;
  startDate: string;
  endDate: string;
  convertDate: string;
  paid: number;
  mysolPrice: number;
  totalDays: number;
  remainingDays: number;
  perDay: number;
  remainingAmount: number;
  mysolPerDay: number;
  recognizedDays: number;
  newExpiry: string;
  savedAt: string;
};

const PERIOD_TYPES: MembershipPeriod[] = ["1개월", "3개월", "6개월", "12개월", "직접 입력"];

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asPeriod(value: unknown): MembershipPeriod {
  return PERIOD_TYPES.includes(value as MembershipPeriod)
    ? (value as MembershipPeriod)
    : "직접 입력";
}

function normalizeConversionHistoryItem(
  value: unknown,
  index: number,
): ConversionHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;

  return {
    id: asString(item.id) || `legacy-conversion-${index}-${Date.now()}`,
    name: asString(item.name),
    periodType: asPeriod(item.periodType),
    startDate: asString(item.startDate),
    endDate: asString(item.endDate),
    convertDate: asString(item.convertDate),
    paid: asNumber(item.paid),
    mysolPrice: asNumber(item.mysolPrice),
    totalDays: asNumber(item.totalDays),
    remainingDays: asNumber(item.remainingDays),
    perDay: asNumber(item.perDay),
    remainingAmount: asNumber(item.remainingAmount),
    mysolPerDay: asNumber(item.mysolPerDay),
    recognizedDays: Math.floor(asNumber(item.recognizedDays)),
    newExpiry: asString(item.newExpiry),
    savedAt: asString(item.savedAt),
  };
}

export function readConversionHistory() {
  try {
    const raw = localStorage.getItem(CONVERSION_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeConversionHistoryItem)
      .filter((item): item is ConversionHistoryItem => item !== null);
  } catch {
    return [];
  }
}
