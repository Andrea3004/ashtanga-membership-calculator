"use client";

import { useEffect, useState } from "react";
import { formatWonFloor } from "./utils";
import { readRefundHistory, RefundHistoryItem } from "./refundHistory";
import { downloadRefundPdf } from "./refundPdf";

export default function RecentHistory({
  storageKey = "refund_history",
  onRestore,
}: {
  storageKey?: string;
  onRestore: (item: RefundHistoryItem) => void;
}) {
  const [items, setItems] = useState<RefundHistoryItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
          <div className="mt-2 text-sm font-medium text-stone-500">
            선택하면 위 계산기에 다시 불러옵니다.
          </div>
        </div>
        <div className="text-sm font-medium text-stone-500">최근 5건</div>
      </div>
      <ul className="divide-y divide-stone-100">
        {items.slice(0, 5).map((item, index) => (
          <li
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onRestore(item)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRestore(item);
              }
            }}
            className="grid cursor-pointer gap-4 rounded-2xl px-3 py-5 transition hover:bg-rose-50/60 focus-visible:bg-rose-50/60 focus-visible:outline-none first:pt-3 last:pb-3 lg:grid-cols-[auto_0.9fr_0.75fr_0.8fr_1fr_auto] lg:items-center"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 font-bold text-rose-700">
              {index + 1}
            </div>
            <div className="text-left">
              <div className="history-label">회원 이름</div>
              <div className="mt-1 font-semibold text-gray-900">{item.name || "-"}</div>
            </div>
            <div className="text-left">
              <div className="history-label">회원권 기간</div>
              <div className="mt-1 font-semibold text-gray-900">{item.periodType}</div>
            </div>
            <div className="text-left">
              <div className="history-label">환불 요청일</div>
              <div className="mt-1 font-semibold text-gray-900">{item.requestDate || "-"}</div>
            </div>
            <div className="text-left">
              <div className="history-label">환불금 · 저장일시</div>
              <div className="mt-1 font-semibold text-gray-900">{formatWonFloor(item.refund)}</div>
              <div className="mt-1 text-sm font-medium text-gray-700">{item.savedAt || "-"}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={downloadingId === item.id}
                onClick={async (event) => {
                  event.stopPropagation();
                  setDownloadingId(item.id);
                  try {
                    await downloadRefundPdf(item);
                  } catch {
                    window.alert("PDF 파일을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
                  } finally {
                    setDownloadingId(null);
                  }
                }}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
              >
                {downloadingId === item.id ? "생성 중" : "PDF"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(item.id);
                }}
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
