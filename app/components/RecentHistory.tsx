"use client";

import { useEffect, useState } from "react";
import { formatWon, formatWonFloor } from "./utils";
import { readRefundHistory, RefundHistoryItem } from "./refundHistory";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function printRefund(item: RefundHistoryItem) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.alert("PDF 출력을 위해 팝업을 허용해주세요.");
    return;
  }

  const rows = [
    ["회원 이름", item.name || "-"],
    ["회원권 기간 유형", item.periodType],
    ["수련 시작일", item.startDate || "-"],
    ["수련 만료일", item.endDate || "-"],
    ["환불 요청일", item.requestDate || "-"],
    ["정상가", formatWon(item.fullPrice)],
    ["실결제액", formatWon(item.paid)],
    ["전체 등록일수", `${item.totalDays}일`],
    ["이용일수", `${item.usedDays}일`],
    ["잔여일수", `${item.remainingDays}일`],
    ["1일 단가", formatWon(item.perDay)],
    ["이용금액", formatWon(item.usedAmount)],
    ["위약금", formatWon(item.penalty)],
    ["카드수수료", formatWon(item.cardFee)],
    ["저장일시", item.savedAt || "-"],
  ];

  printWindow.document.write(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>환불 계산서 - ${escapeHtml(item.name || "회원")}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #242124; background: #fff; font-family: Arial, "Noto Sans KR", sans-serif; }
    .document { max-width: 760px; margin: 0 auto; }
    .brand { color: #9f5968; font-size: 12px; font-weight: 800; letter-spacing: 3px; }
    h1 { margin: 12px 0 22px; font-size: 30px; }
    .notice { padding: 18px 20px; border: 1px solid #eadde0; background: #fff9fa; color: #574f51; font-size: 12px; line-height: 1.75; }
    .notice p { margin: 0 0 8px; }
    .notice p:last-child { margin-bottom: 0; }
    table { width: 100%; margin-top: 24px; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 11px 14px; border-bottom: 1px solid #eee7e9; text-align: left; }
    th { width: 38%; color: #675d60; background: #fcfafb; font-weight: 700; }
    td { font-weight: 600; }
    .refund { margin-top: 28px; padding: 24px; border: 2px solid #d994a5; background: #fff6f8; text-align: center; }
    .refund-label { color: #76545d; font-size: 13px; font-weight: 700; }
    .refund-value { margin-top: 9px; color: #2c2023; font-size: 34px; font-weight: 900; }
    .footer { margin-top: 26px; color: #8a8082; font-size: 10px; text-align: center; }
    @media print { .document { max-width: none; } }
  </style>
</head>
<body>
  <main class="document">
    <div class="brand">ASHTANGA YOGA STUDIO</div>
    <h1>환불 계산서</h1>
    <section class="notice">
      <p>본 환불 계산서는 공정거래위원회 소비자분쟁해결기준 및 ASHTANGA YOGA STUDIO 환불 규정에 따라 산정된 참고용 계산서입니다.</p>
      <p>환불 금액은 회원권 계약 내용, 이용 내역 및 환불 규정에 따라 산정되었으며, 최종 환불 금액은 확인 절차를 거쳐 확정될 수 있습니다.</p>
      <p>본 문서는 회원권 기간, 이용 내역, 환불 산정 기준을 함께 확인할 수 있도록 작성되었습니다.</p>
    </section>
    <table>
      <tbody>
        ${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
      </tbody>
    </table>
    <section class="refund">
      <div class="refund-label">최종 환불 예상금액</div>
      <div class="refund-value">${formatWonFloor(item.refund)}</div>
    </section>
    <div class="footer">ASHTANGA YOGA STUDIO · 환불 계산 참고 문서</div>
  </main>
</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.setTimeout(() => printWindow.print(), 250);
}

export default function RecentHistory({
  storageKey = "refund_history",
  onRestore,
}: {
  storageKey?: string;
  onRestore: (item: RefundHistoryItem) => void;
}) {
  const [items, setItems] = useState<RefundHistoryItem[]>([]);

  useEffect(() => {
    function loadItems() {
      setItems(readRefundHistory(storageKey));
    }

    loadItems();
    window.addEventListener("refund-history-updated", loadItems);
    return () => window.removeEventListener("refund-history-updated", loadItems);
  }, [storageKey]);

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  if (items.length === 0) return null;

  return (
    <div className="studio-card overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">RECENT RECORDS</div>
          <h3 className="mt-1 text-xl font-bold text-gray-900">최근 환불 이력</h3>
        </div>
        <div className="text-sm font-medium text-stone-500">최근 5건</div>
      </div>
      <ul className="divide-y divide-stone-100">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="grid gap-4 py-5 first:pt-0 last:pb-0 lg:grid-cols-[0.9fr_0.75fr_0.8fr_1fr_auto] lg:items-center">
            <button type="button" onClick={() => onRestore(item)} className="text-left">
              <div className="history-label">회원 이름</div>
              <div className="mt-1 font-semibold text-gray-900">{item.name || "-"}</div>
            </button>
            <button type="button" onClick={() => onRestore(item)} className="text-left">
              <div className="history-label">회원권 기간</div>
              <div className="mt-1 font-semibold text-gray-900">{item.periodType}</div>
            </button>
            <button type="button" onClick={() => onRestore(item)} className="text-left">
              <div className="history-label">환불 요청일</div>
              <div className="mt-1 font-semibold text-gray-900">{item.requestDate || "-"}</div>
            </button>
            <button type="button" onClick={() => onRestore(item)} className="text-left">
              <div className="history-label">환불금 · 저장일시</div>
              <div className="mt-1 font-semibold text-gray-900">{formatWonFloor(item.refund)}</div>
              <div className="mt-1 text-sm font-medium text-gray-700">{item.savedAt || "-"}</div>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printRefund(item)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
