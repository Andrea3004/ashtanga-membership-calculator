"use client";

import { useState } from "react";
import RefundCalculator from "./components/RefundCalculator";
import ConversionCalculator from "./components/ConversionCalculator";

export default function Home() {
  const [tab, setTab] = useState<"refund" | "convert">("refund");

  return (
    <div className="relative flex-1 px-5 py-8 font-sans text-stone-900 sm:px-8 sm:py-10">
      <div className="ambient-lotus ambient-lotus-left" aria-hidden="true" />
      <div className="ambient-lotus ambient-lotus-right" aria-hidden="true" />
      <main className="relative mx-auto max-w-[1400px]">
        <div className="mb-8 flex max-w-md gap-2 rounded-2xl border border-white/80 bg-white/55 p-1.5 shadow-sm backdrop-blur">
          <button
            onClick={() => setTab("refund")}
            className={`flex-1 rounded-xl px-5 py-3 text-[0.95rem] font-semibold transition ${
              tab === "refund"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            환불 계산기
          </button>
          <button
            onClick={() => setTab("convert")}
            className={`flex-1 rounded-xl px-5 py-3 text-[0.95rem] font-semibold transition ${
              tab === "convert"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            회원 전환 계산기
          </button>
        </div>

        <div className="space-y-4">
          {tab === "refund" ? <RefundCalculator /> : <ConversionCalculator />}
        </div>
      </main>
    </div>
  );
}
