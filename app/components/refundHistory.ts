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

  return {
    id: asString(item.id) || `legacy-${index}-${Date.now()}`,
    name: asString(item.name),
    periodType: asPeriod(item.periodType),
    startDate: asString(item.startDate),
    endDate: asString(item.endDate),
    requestDate: asString(item.requestDate),
    fullPrice: asNumber(item.fullPrice),
    paid: asNumber(item.paid),
    penaltyRate: item.penaltyRate === undefined ? 10 : asNumber(item.penaltyRate),
    cardFee: asNumber(item.cardFee),
    totalDays: asNumber(item.totalDays),
    usedDays: asNumber(item.usedDays),
    remainingDays: asNumber(item.remainingDays),
    perDay: asNumber(item.perDay),
    usedAmount: asNumber(item.usedAmount),
    penalty: asNumber(item.penalty),
    refund: Math.floor(asNumber(item.refund)),
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
