import { calculateUsageDays } from "./utils";

export type MembershipPeriod = "1개월" | "3개월" | "6개월" | "12개월" | "직접 입력";

export type RefundHistoryItem = {
  id: string;
  name: string;
  periodType: MembershipPeriod;
  startDate: string;
  endDate: string;
  requestDate: string;
  fullPrice: number;
  paid: number;
  penaltyRate: number;
  cardFee: number;
  totalDays: number;
  originalEndDate: string;
  holdingDays: number;
  adjustedEndDate: string;
  usedDays: number;
  remainingDays: number;
  perDay: number;
  usedAmount: number;
  penalty: number;
  refund: number;
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

export function normalizeRefundHistoryItem(
  value: unknown,
  index = 0,
): RefundHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const endDate = asString(item.endDate);
  const originalEndDate = asString(item.originalEndDate) || endDate;
  const adjustedEndDate = asString(item.adjustedEndDate) || endDate;
  const startDate = asString(item.startDate);
  const requestDate = asString(item.requestDate);
  const totalDays = asNumber(item.totalDays);
  const paid = asNumber(item.paid);
  const penaltyRate = item.penaltyRate === undefined ? 10 : asNumber(item.penaltyRate);
  const cardFee = asNumber(item.cardFee);
  const usage = calculateUsageDays(startDate, requestDate, totalDays);
  const usedDays = usage?.usedDays ?? asNumber(item.usedDays);
  const remainingDays = usage?.remainingDays ?? asNumber(item.remainingDays);
  const perDay = totalDays > 0 ? paid / totalDays : asNumber(item.perDay);
  const usedAmount = perDay * usedDays;
  const penalty = (paid * penaltyRate) / 100;
  const refund = Math.max(
    0,
    Math.floor(paid - usedAmount - penalty - cardFee),
  );

  return {
    id: asString(item.id) || `legacy-${index}-${Date.now()}`,
    name: asString(item.name),
    periodType: asPeriod(item.periodType),
    startDate,
    endDate,
    requestDate,
    fullPrice: asNumber(item.fullPrice),
    paid,
    penaltyRate,
    cardFee,
    totalDays,
    originalEndDate,
    holdingDays: Math.max(0, asNumber(item.holdingDays)),
    adjustedEndDate,
    usedDays,
    remainingDays,
    perDay,
    usedAmount,
    penalty,
    refund,
    savedAt: asString(item.savedAt),
  };
}

export function readRefundHistory(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => normalizeRefundHistoryItem(item, index))
      .filter((item): item is RefundHistoryItem => item !== null);
  } catch {
    return [];
  }
}
