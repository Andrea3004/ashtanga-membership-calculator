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
    localStorage.setItem(
      "refund_history",
      JSON.stringify([item, ...list].slice(0, 20)),
    );
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
        <section className="studio-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-tile">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="section-title">환불 정보</div>
              <div className="helper-text">회원 정보와 환불 조건을 입력하세요.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label>
              <div>회원 이름</div>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <label>
              <div>회원권 기간</div>
              <select
                value={periodType}
                onChange={(event) =>
                  handlePeriodChange(event.target.value as MembershipPeriod)
                }
              >
                <option>1개월</option>
                <option>3개월</option>
                <option>6개월</option>
                <option>12개월</option>
                <option>직접 입력</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div>수련 시작일</div>
                <input
                  value={start}
                  onChange={(event) => handleStartChange(event.target.value)}
                  type="date"
                />
              </label>
              <label>
                <div>수련 만료일</div>
                <input
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  type="date"
                />
              </label>
            </div>

            <label>
              <div>환불 요청일</div>
              <input
                value={request}
                onChange={(event) => setRequest(event.target.value)}
                type="date"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div>정상가</div>
                <input
                  value={fullPrice}
                  onChange={(event) =>
                    setFullPrice(parseMoneyInput(event.target.value))
                  }
                  type="number"
                  min="0"
                />
              </label>
              <label>
                <div>실결제액</div>
                <input
                  value={paid}
                  onChange={(event) => setPaid(parseMoneyInput(event.target.value))}
                  type="number"
                  min="0"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div>위약금 비율 (%)</div>
                <input
                  value={penaltyRate}
                  onChange={(event) => setPenaltyRate(Number(event.target.value))}
                  type="number"
                />
              </label>
              <label>
                <div>카드수수료</div>
                <input
                  value={cardFee}
                  onChange={(event) =>
                    setCardFee(parseMoneyInput(event.target.value))
                  }
                  type="number"
                  min="0"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button onClick={saveHistory} className="primary-button">
                환불 이력 저장
              </button>
              <button onClick={reset} className="secondary-button">
                초기화
              </button>
            </div>
          </div>
        </section>

        <section className="studio-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="section-eyebrow">계산 결과</div>
              <div className="result-grid mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <div className="result-label">전체 등록일수</div>
                  <div className="font-medium">{computed ? computed.totalDays : "-"}</div>
                </div>
                <div>
                  <div className="result-label">이용일수</div>
                  <div className="font-medium">{computed ? computed.usedDays : "-"}</div>
                </div>
                <div>
                  <div className="result-label">잔여일수</div>
                  <div className="font-medium">
                    {computed ? computed.remainingDays : "-"}
                  </div>
                </div>
                <div>
                  <div className="result-label">정상가 기준 1일 단가</div>
                  <div className="font-medium">
                    {computed ? formatWon(computed.perDay) : "-"}
                  </div>
                </div>
                <div>
                  <div className="result-label">정상가 기준 이용금액</div>
                  <div className="font-medium">
                    {computed ? formatWon(computed.usedAmount) : "-"}
                  </div>
                </div>
                <div>
                  <div className="result-label">위약금</div>
                  <div className="font-medium">
                    {computed ? formatWon(computed.penalty) : "-"}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="result-label">카드수수료</div>
              <div className="font-medium">{formatWon(cardFee)}</div>
            </div>
          </div>

          <div className="result-spotlight mt-10 flex min-h-64 items-center justify-center p-8 text-center sm:p-10">
            <div className="relative z-[1]">
              <div className="result-title">최종 환불 예상금액</div>
              <div className="result-value">
                {computed ? formatWonFloor(computed.final) : "-"}
              </div>
              <div className="result-caption">
                입력한 이용 기간과 공제 조건을 반영한 예상 금액입니다.
              </div>
            </div>
            <div className="result-watermark">
              <Dollar className="h-32 w-32" />
            </div>
          </div>
        </section>
      </div>

      <RecentHistory onRestore={restoreHistory} />
    </div>
  );
}
