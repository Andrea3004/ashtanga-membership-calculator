"use client";

import { useMemo, useState } from "react";
import {
  addDaysToDateString,
  daysBetweenExclusive,
  daysBetweenInclusive,
  formatWon,
  formatWonFloor,
  parseLocalDate,
  parseMoneyInput,
} from "./utils";
import RecentHistory from "./RecentHistory";
import {
  MembershipPeriod,
  readRefundHistory,
  RefundHistoryItem,
} from "./refundHistory";
import { Dollar, User } from "./Icon";

const PERIOD_DAYS: Record<Exclude<MembershipPeriod, "직접 입력">, number> = {
  "1개월": 30,
  "3개월": 90,
  "6개월": 180,
  "12개월": 365,
};

export default function RefundCalculator() {
  const [name, setName] = useState("");
  const [periodType, setPeriodType] = useState<MembershipPeriod>("직접 입력");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [request, setRequest] = useState("");
  const [fullPrice, setFullPrice] = useState(0);
  const [paid, setPaid] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(10);
  const [cardFee, setCardFee] = useState(0);

  const computed = useMemo(() => {
    const s = parseLocalDate(start);
    const e = parseLocalDate(end);
    const r = parseLocalDate(request);
    if (!s || !e || !r) return null;

    const totalDays = daysBetweenInclusive(s, e);
    const usedDays = daysBetweenInclusive(s, r);
    const remainingDays = daysBetweenExclusive(r, e);
    const perDay = fullPrice / totalDays;
    const usedAmount = perDay * usedDays;
    const penalty = (paid * penaltyRate) / 100;
    const final = Math.max(
      0,
      Math.floor(paid - usedAmount - penalty - cardFee),
    );

    return {
      totalDays,
      usedDays,
      remainingDays,
      perDay,
      usedAmount,
      penalty,
      final,
    };
  }, [start, end, request, fullPrice, paid, penaltyRate, cardFee]);

  function calculateEndDate(nextStart: string, nextPeriod: MembershipPeriod) {
    if (!nextStart || nextPeriod === "직접 입력") return;
    setEnd(addDaysToDateString(nextStart, PERIOD_DAYS[nextPeriod] - 1));
  }

  function handleStartChange(nextStart: string) {
    setStart(nextStart);
    calculateEndDate(nextStart, periodType);
  }

  function handlePeriodChange(nextPeriod: MembershipPeriod) {
    setPeriodType(nextPeriod);
    calculateEndDate(start, nextPeriod);
  }

  function saveHistory() {
    if (!computed) return;
    const list = readRefundHistory("refund_history");
    const item: RefundHistoryItem = {
      id: String(Date.now()),
      name,
      periodType,
      startDate: start,
      endDate: end,
      requestDate: request,
      fullPrice,
      paid,
      penaltyRate,
      cardFee,
      totalDays: computed.totalDays,
      usedDays: computed.usedDays,
      remainingDays: computed.remainingDays,
      perDay: computed.perDay,
      usedAmount: computed.usedAmount,
      penalty: computed.penalty,
      refund: Math.floor(computed.final),
      savedAt: new Date().toLocaleString("ko-KR"),
    };
    localStorage.setItem("refund_history", JSON.stringify([item, ...list].slice(0, 20)));
    window.dispatchEvent(new Event("refund-history-updated"));
  }

  function restoreHistory(item: RefundHistoryItem) {
    setName(item.name);
    setPeriodType(item.periodType);
    setStart(item.startDate);
    setEnd(item.endDate);
    setRequest(item.requestDate);
    setFullPrice(item.fullPrice);
    setPaid(item.paid);
    setPenaltyRate(item.penaltyRate);
    setCardFee(item.cardFee);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setName("");
    setPeriodType("직접 입력");
    setStart("");
    setEnd("");
    setRequest("");
    setFullPrice(0);
    setPaid(0);
    setPenaltyRate(10);
    setCardFee(0);
  }

  return (
    <div className="calculator-shell space-y-8">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div className="studio-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-pink-50 p-2">
              <User className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <div className="section-title">환불 정보</div>
              <div className="helper-text">회원 정보와 환불 조건을 입력하세요.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label>
              <div className="text-xs text-zinc-600">회원 이름</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </label>

            <label>
              <div className="text-xs text-zinc-600">회원권 기간</div>
              <select
                value={periodType}
                onChange={(e) => handlePeriodChange(e.target.value as MembershipPeriod)}
                className="mt-1 min-h-[2.85rem] w-full rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900"
              >
                <option>1개월</option>
                <option>3개월</option>
                <option>6개월</option>
                <option>12개월</option>
                <option>직접 입력</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">수련 시작일</div>
                <input value={start} onChange={(e) => handleStartChange(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">수련 만료일</div>
                <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <label>
              <div className="text-xs text-zinc-600">환불 요청일</div>
              <input value={request} onChange={(e) => setRequest(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">정상가</div>
                <input value={fullPrice} onChange={(e) => setFullPrice(parseMoneyInput(e.target.value))} type="number" min="0" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">실결제액</div>
                <input value={paid} onChange={(e) => setPaid(parseMoneyInput(e.target.value))} type="number" min="0" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">위약금 비율 (%)</div>
                <input value={penaltyRate} onChange={(e) => setPenaltyRate(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">카드수수료</div>
                <input value={cardFee} onChange={(e) => setCardFee(parseMoneyInput(e.target.value))} type="number" min="0" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveHistory} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-purple-400 px-4 py-2 text-sm font-semibold text-white shadow">저장</button>
              <button onClick={reset} className="rounded-full border px-4 py-2 text-sm">초기화</button>
            </div>
          </div>
        </div>

        <div className="studio-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="section-eyebrow">계산 결과</div>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <div className="text-xs text-zinc-600">전체 등록일수</div>
                  <div className="font-medium">{computed ? computed.totalDays : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">이용일수</div>
                  <div className="font-medium">{computed ? computed.usedDays : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">잔여일수</div>
                  <div className="font-medium">{computed ? computed.remainingDays : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">정상가 기준 1일 단가</div>
                  <div className="font-medium">{computed ? formatWon(computed.perDay) : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">정상가 기준 이용금액</div>
                  <div className="font-medium">{computed ? formatWon(computed.usedAmount) : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">위약금</div>
                  <div className="font-medium">{computed ? formatWon(computed.penalty) : "-"}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-zinc-500">카드수수료</div>
                <div className="font-medium">{formatWon(cardFee)}</div>
              </div>
            </div>
          </div>

          <div className="result-spotlight mt-10 flex min-h-64 items-center justify-center p-8 text-center sm:p-10">
            <div className="relative z-[1]">
              <div className="text-base font-bold tracking-wide text-gray-800">최종 환불 예상금액</div>
              <div className="mt-4 text-5xl font-black tracking-[-0.05em] text-gray-900 sm:text-6xl">{computed ? formatWonFloor(computed.final) : "-"}</div>
              <div className="mt-5 text-sm font-medium text-gray-700">입력한 이용 기간과 공제 조건을 반영한 예상 금액입니다.</div>
            </div>
            <div className="result-watermark text-rose-200">
              <Dollar className="h-32 w-32" />
            </div>
          </div>
        </div>
      </div>

      <RecentHistory onRestore={restoreHistory} />
    </div>
  );
}
