"use client";

import { useMemo, useState } from "react";
import { parseLocalDate, daysBetweenInclusive, formatWon } from "./utils";
import { Calendar } from "./Icon";

export default function ConversionCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [convertDate, setConvertDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [mysolPrice, setMysolPrice] = useState(0);
  const [mysolDays, setMysolDays] = useState(30);

  const computed = useMemo(() => {
    const s = parseLocalDate(start);
    const e = parseLocalDate(end);
    const c = parseLocalDate(convertDate);
    if (!s || !e || !c) return null;

    const totalDays = daysBetweenInclusive(s, e);
    const remainingDays = daysBetweenInclusive(c, e);
    const perDay = paid / totalDays;
    const remainingAmount = perDay * remainingDays;
    const mysolPerDay = mysolPrice / mysolDays;
    const 인정Days = Math.floor(remainingAmount / mysolPerDay);
    const newExpiry = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    newExpiry.setDate(newExpiry.getDate() + 인정Days - 1);

    return {
      totalDays,
      remainingDays,
      perDay,
      remainingAmount,
      mysolPerDay,
      인정Days,
      newExpiry,
    };
  }, [start, end, convertDate, paid, mysolPrice, mysolDays]);

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
              <div className="helper-text">일반회원에서 마이솔로 전환할 때 사용합니다.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">일반회원 시작일</div>
                <input value={start} onChange={(e) => setStart(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">일반회원 만료일</div>
                <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <label>
              <div className="text-xs text-zinc-600">전환일</div>
              <input value={convertDate} onChange={(e) => setConvertDate(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">일반회원 실결제액</div>
                <input value={paid} onChange={(e) => setPaid(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">마이솔 기준가</div>
                <input value={mysolPrice} onChange={(e) => setMysolPrice(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <label>
              <div className="text-xs text-zinc-600">마이솔 기간일수</div>
              <input value={mysolDays} onChange={(e) => setMysolDays(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </label>
          </div>
        </div>

        <div className="studio-card p-6 sm:p-8">
          <div>
            <div className="section-eyebrow">계산 결과</div>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <div className="text-xs text-zinc-600">일반회원 전체일수</div>
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
                <div className="text-xs text-zinc-600">마이솔 1일 단가</div>
                <div className="font-medium">{computed ? formatWon(computed.mysolPerDay) : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">전환 후 인정일수</div>
                <div className="font-medium">{computed ? computed.인정Days : "-"}</div>
              </div>
            </div>

            <div className="result-spotlight result-spotlight-violet mt-10 flex min-h-64 items-center justify-center p-8 text-center sm:p-10">
              <div className="relative z-[1]">
                <div className="text-base font-bold tracking-wide text-gray-800">새 마이솔 만료일</div>
                <div className="mt-4 text-5xl font-black tracking-[-0.05em] text-gray-900 sm:text-6xl">{computed ? computed.newExpiry.toLocaleDateString() : "-"}</div>
                <div className="mt-5 text-sm font-medium text-gray-700">잔여 금액을 마이솔 일 단가로 전환한 예상 만료일입니다.</div>
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
