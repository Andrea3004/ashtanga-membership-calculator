"use client";

import { useState } from "react";
import RefundCalculator from "./components/RefundCalculator";
import ConversionCalculator from "./components/ConversionCalculator";

export default function Home() {
  const [tab, setTab] = useState<"refund" | "convert">("refund");

  return (
    <div className="relative flex-1 px-5 py-9 font-sans sm:px-8 sm:py-12">
      <div className="ambient-lotus ambient-lotus-left" aria-hidden="true" />
      <div className="ambient-lotus ambient-lotus-right" aria-hidden="true" />
      <main className="relative mx-auto max-w-[1400px]">
        <div className="tab-shell mb-8 flex max-w-md gap-1.5 p-1.5">
          <button
            onClick={() => setTab("refund")}
            className={`tab-button flex-1 px-5 py-3 text-[0.95rem] font-semibold ${
              tab === "refund" ? "tab-button-active" : ""
            }`}
          >
            환불 계산기
          </button>
          <button
            onClick={() => setTab("convert")}
            className={`tab-button flex-1 px-5 py-3 text-[0.95rem] font-semibold ${
              tab === "convert" ? "tab-button-active" : ""
            }`}
          >
            회원 전환 계산기
          </button>
        </div>

        {tab === "refund" ? <RefundCalculator /> : <ConversionCalculator />}
      </main>
    </div>
  );
}
