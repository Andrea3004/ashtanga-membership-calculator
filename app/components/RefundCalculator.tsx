"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseLocalDate,
  daysBetweenInclusive,
  daysBetweenExclusive,
  formatWon,
} from "./utils";
import RecentHistory from "./RecentHistory";
import { Dollar, User } from "./Icon";

export default function RefundCalculator() {
  const [name, setName] = useState("");
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
    const perDay = paid / totalDays;
    const usedAmount = perDay * usedDays;
    const penalty = (paid * penaltyRate) / 100;
    const final = Math.max(0, paid - usedAmount - penalty - cardFee);

    return {
      totalDays,
      usedDays,
      remainingDays,
      perDay,
      usedAmount,
      penalty,
      final,
    };
  }, [start, end, request, paid, penaltyRate, cardFee]);

  function saveHistory() {
    if (!computed) return;
    const raw = localStorage.getItem("refund_history");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      id: String(Date.now()),
      name,
      requestDate: request,
      refund: Math.round(computed.final),
      savedAt: new Date().toLocaleString(),
    });
    localStorage.setItem("refund_history", JSON.stringify(list.slice(0, 20)));
    window.dispatchEvent(new Event("refund-history-updated"));
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

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">수련 시작일</div>
                <input value={start} onChange={(e) => setStart(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
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
                <input value={fullPrice} onChange={(e) => setFullPrice(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">실결제액</div>
                <input value={paid} onChange={(e) => setPaid(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-xs text-zinc-600">위약금 비율 (%)</div>
                <input value={penaltyRate} onChange={(e) => setPenaltyRate(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
              <label>
                <div className="text-xs text-zinc-600">카드수수료</div>
                <input value={cardFee} onChange={(e) => setCardFee(Number(e.target.value))} type="number" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveHistory} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-purple-400 px-4 py-2 text-sm font-semibold text-white shadow">저장</button>
              <button onClick={() => { setName(""); setStart(""); setEnd(""); setRequest(""); setFullPrice(0); setPaid(0); setPenaltyRate(10); setCardFee(0); }} className="rounded-full border px-4 py-2 text-sm">초기화</button>
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
                  <div className="text-xs text-zinc-600">1일 단가</div>
                  <div className="font-medium">{computed ? formatWon(computed.perDay) : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">이용금액</div>
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
              <div className="mt-4 text-5xl font-black tracking-[-0.05em] text-gray-900 sm:text-6xl">{computed ? formatWon(computed.final) : "-"}</div>
              <div className="mt-5 text-sm font-medium text-gray-700">입력한 이용 기간과 공제 조건을 반영한 예상 금액입니다.</div>
            </div>
            <div className="result-watermark text-rose-200">
              <Dollar className="h-32 w-32" />
            </div>
          </div>
        </div>
      </div>

      <RecentHistory />
    </div>
  );
}
