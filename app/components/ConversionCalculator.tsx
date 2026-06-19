"use client";

import { useMemo, useState } from "react";
import {
  addDaysToDateString,
  daysBetweenInclusive,
  formatWon,
  parseLocalDate,
  parseMoneyInput,
} from "./utils";
import { Calendar } from "./Icon";
import { MembershipPeriod } from "./refundHistory";
import {
  CONVERSION_HISTORY_KEY,
  ConversionHistoryItem,
  readConversionHistory,
} from "./conversionHistory";
import RecentConversionHistory from "./RecentConversionHistory";

const PERIOD_DAYS: Record<Exclude<MembershipPeriod, "직접 입력">, number> = {
  "1개월": 30,
  "3개월": 90,
  "6개월": 180,
  "12개월": 365,
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ConversionCalculator() {
  const [name, setName] = useState("");
  const [periodType, setPeriodType] = useState<MembershipPeriod>("직접 입력");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [convertDate, setConvertDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [mysolPrice, setMysolPrice] = useState(0);

  const computed = useMemo(() => {
    const s = parseLocalDate(start);
    const e = parseLocalDate(end);
    const c = parseLocalDate(convertDate);
    if (!s || !e || !c) return null;

    const totalDays = daysBetweenInclusive(s, e);
    const remainingDays = daysBetweenInclusive(c, e);
    const perDay = paid / totalDays;
    const remainingAmount = perDay * remainingDays;
    const mysolPerDay = mysolPrice / totalDays;
    const recognizedDays = Math.floor(remainingAmount / mysolPerDay);
    const newExpiry = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    newExpiry.setDate(newExpiry.getDate() + recognizedDays - 1);

    return {
      totalDays,
      remainingDays,
      perDay,
      remainingAmount,
      mysolPerDay,
      recognizedDays,
      newExpiry,
    };
  }, [start, end, convertDate, paid, mysolPrice]);

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
    const item: ConversionHistoryItem = {
      id: String(Date.now()),
      name,
      periodType,
      startDate: start,
      endDate: end,
      convertDate,
      paid,
      mysolPrice,
      totalDays: computed.totalDays,
      remainingDays: computed.remainingDays,
      perDay: computed.perDay,
      remainingAmount: computed.remainingAmount,
      mysolPerDay: computed.mysolPerDay,
      recognizedDays: computed.recognizedDays,
      newExpiry: formatDateInput(computed.newExpiry),
      savedAt: new Date().toLocaleString("ko-KR"),
    };
    const list = readConversionHistory();
    localStorage.setItem(
      CONVERSION_HISTORY_KEY,
      JSON.stringify([item, ...list].slice(0, 20)),
    );
    window.dispatchEvent(new Event("conversion-history-updated"));
  }

  function restoreHistory(item: ConversionHistoryItem) {
    setName(item.name);
    setPeriodType(item.periodType);
    setStart(item.startDate);
    setEnd(item.endDate);
    setConvertDate(item.convertDate);
    setPaid(item.paid);
    setMysolPrice(item.mysolPrice);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setName("");
    setPeriodType("직접 입력");
    setStart("");
    setEnd("");
    setConvertDate("");
    setPaid(0);
    setMysolPrice(0);
  }

  return (
    <div className="calculator-shell space-y-8">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <section className="studio-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-tile">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="section-title">회원 전환</div>
              <div className="helper-text">
                일반회원의 남은 잔여가치를 마이솔 동일 조건 1일 단가로 환산해 인정일수와 새 만료일을 계산합니다.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label>
              <div>회원 이름</div>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <label>
              <div>일반회원권 기간</div>
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
                <div>일반회원 시작일</div>
                <input
                  value={start}
                  onChange={(event) => handleStartChange(event.target.value)}
                  type="date"
                />
              </label>
              <label>
                <div>일반회원 만료일</div>
                <input
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  type="date"
                />
              </label>
            </div>

            <label>
              <div>전환일</div>
              <input
                value={convertDate}
                onChange={(event) => setConvertDate(event.target.value)}
                type="date"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div>일반회원 실결제액</div>
                <input
                  value={paid}
                  onChange={(event) => setPaid(parseMoneyInput(event.target.value))}
                  type="number"
                  min="0"
                />
              </label>
              <label>
                <div>마이솔 동일 조건 기준가</div>
                <input
                  value={mysolPrice}
                  onChange={(event) =>
                    setMysolPrice(parseMoneyInput(event.target.value))
                  }
                  type="number"
                  min="0"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button onClick={saveHistory} className="primary-button">
                전환 이력 저장
              </button>
              <button onClick={reset} className="secondary-button">
                초기화
              </button>
            </div>
          </div>
        </section>

        <section className="studio-card p-6 sm:p-8">
          <div className="section-eyebrow">계산 결과</div>
          <div className="result-grid mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <div className="result-label">회원 이름</div>
              <div className="font-medium">{name || "-"}</div>
            </div>
            <div>
              <div className="result-label">일반회원권 기간</div>
              <div className="font-medium">{periodType}</div>
            </div>
            <div>
              <div className="result-label">전체 등록일수</div>
              <div className="font-medium">{computed ? computed.totalDays : "-"}</div>
            </div>
            <div>
              <div className="result-label">일반회원 잔여일수</div>
              <div className="font-medium">{computed ? computed.remainingDays : "-"}</div>
            </div>
            <div>
              <div className="result-label">일반회원 1일 단가</div>
              <div className="font-medium">{computed ? formatWon(computed.perDay) : "-"}</div>
            </div>
            <div>
              <div className="result-label">일반회원 잔여금액</div>
              <div className="font-medium">
                {computed ? formatWon(computed.remainingAmount) : "-"}
              </div>
            </div>
            <div>
              <div className="result-label">마이솔 동일 조건 1일 단가</div>
              <div className="font-medium">
                {computed ? formatWon(computed.mysolPerDay) : "-"}
              </div>
            </div>
            <div>
              <div className="result-label">전환 후 마이솔 인정일수</div>
              <div className="font-medium">
                {computed ? computed.recognizedDays : "-"}
              </div>
            </div>
          </div>

          <div className="result-spotlight mt-10 flex min-h-64 items-center justify-center p-8 text-center sm:p-10">
            <div className="relative z-[1]">
              <div className="result-title">새 마이솔 만료일</div>
              <div className="result-value">
                {computed ? computed.newExpiry.toLocaleDateString("ko-KR") : "-"}
              </div>
              <div className="result-caption">일반회원 → 마이솔 동일 조건 전환</div>
            </div>
            <div className="result-watermark">
              <Calendar className="h-32 w-32" />
            </div>
          </div>
        </section>
      </div>

      <RecentConversionHistory onRestore={restoreHistory} />
    </div>
  );
}
