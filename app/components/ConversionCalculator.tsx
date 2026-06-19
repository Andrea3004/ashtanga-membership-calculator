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

type MembershipPeriod = "1개월" | "3개월" | "6개월" | "12개월" | "직접 입력";

const PERIOD_DAYS: Record<Exclude<MembershipPeriod, "직접 입력">, number> = {
  "1개월": 30,
  "3개월": 90,
  "6개월": 180,
  "12개월": 365,
};

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

  return (
    <div className="calculator-shell space-y-8">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div className="studio-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="section-title">회원 전환</div>
              <div className="helper-text">
                일반회원의 남은 잔여가치를 마이솔 동일 조건 1일 단가로 환산해 인정일수와 새 만료일을 계산합니다.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label>
              <div className="text-xs text-zinc-600">회원 이름</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </label>

            <label>
              <div className="text-xs text-zinc-600">일반회원권 기간</div>
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
                <div className="text-xs text-zinc-600">일반회원 시작일</div>
                <input
                  value={start}
                  onChange={(e) => handleStartChange(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </label>
              <label>
                <div className="text-xs text-zinc-600">일반회원 만료일</div>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label>
              <div className="text-xs text-zinc-600">전환일</div>
              <input
                value={convertDate}
                onChange={(e) => setConvertDate(e.target.value)}
                type="date"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">일반회원 실결제액</div>
                <input
                  value={paid}
                  onChange={(e) => setPaid(parseMoneyInput(e.target.value))}
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </label>
              <label>
                <div className="text-xs text-zinc-600">마이솔 동일 조건 기준가</div>
                <input
                  value={mysolPrice}
                  onChange={(e) => setMysolPrice(parseMoneyInput(e.target.value))}
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="studio-card p-6 sm:p-8">
          <div>
            <div className="section-eyebrow">계산 결과</div>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <div className="text-xs text-zinc-600">회원 이름</div>
                <div className="font-medium">{name || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">일반회원권 기간</div>
                <div className="font-medium">{periodType}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">전체 등록일수</div>
                <div className="font-medium">{computed ? computed.totalDays : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">일반회원 잔여일수</div>
                <div className="font-medium">{computed ? computed.remainingDays : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">일반회원 1일 단가</div>
                <div className="font-medium">{computed ? formatWon(computed.perDay) : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">일반회원 잔여금액</div>
                <div className="font-medium">{computed ? formatWon(computed.remainingAmount) : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">마이솔 동일 조건 1일 단가</div>
                <div className="font-medium">{computed ? formatWon(computed.mysolPerDay) : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">전환 후 마이솔 인정일수</div>
                <div className="font-medium">{computed ? computed.recognizedDays : "-"}</div>
              </div>
            </div>

            <div className="result-spotlight result-spotlight-violet mt-10 flex min-h-64 items-center justify-center p-8 text-center sm:p-10">
              <div className="relative z-[1]">
                <div className="text-base font-bold tracking-wide text-gray-800">새 마이솔 만료일</div>
                <div className="mt-4 text-5xl font-black tracking-[-0.05em] text-gray-900 sm:text-6xl">
                  {computed ? computed.newExpiry.toLocaleDateString("ko-KR") : "-"}
                </div>
                <div className="mt-5 text-sm font-medium text-gray-700">
                  일반회원 → 마이솔 동일 조건 전환
                </div>
              </div>
              <div className="result-watermark text-violet-200">
                <Calendar className="h-32 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
