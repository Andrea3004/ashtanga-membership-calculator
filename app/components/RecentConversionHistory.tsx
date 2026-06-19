"use client";

import { useEffect, useState } from "react";
import {
  CONVERSION_HISTORY_KEY,
  ConversionHistoryItem,
  readConversionHistory,
} from "./conversionHistory";
import { downloadConversionPdf } from "./conversionPdf";

export default function RecentConversionHistory({
  onRestore,
}: {
  onRestore: (item: ConversionHistoryItem) => void;
}) {
  const [items, setItems] = useState<ConversionHistoryItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    function loadItems() {
      setItems(readConversionHistory());
    }

    loadItems();
    window.addEventListener("conversion-history-updated", loadItems);
    return () => window.removeEventListener("conversion-history-updated", loadItems);
  }, []);

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem(CONVERSION_HISTORY_KEY, JSON.stringify(next));
  }

  if (items.length === 0) return null;

  return (
    <section className="studio-card history-card overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">CONVERSION RECORDS</div>
          <h3 className="mt-1 text-xl font-bold text-gray-900">최근 회원 전환 이력</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            이력을 선택하면 위 계산기에 상세 내용을 다시 불러옵니다.
          </p>
        </div>
        <div className="history-count">최근 5건</div>
      </div>

      <ul className="divide-y divide-slate-100">
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
            className="history-row grid cursor-pointer gap-4 px-3 py-5 lg:grid-cols-[auto_0.85fr_0.75fr_0.75fr_0.65fr_0.9fr_1fr_auto] lg:items-center"
          >
            <div className="history-number">{index + 1}</div>
            <div>
              <div className="history-label">회원 이름</div>
              <div className="history-value">{item.name || "-"}</div>
            </div>
            <div>
              <div className="history-label">회원권 기간</div>
              <div className="history-value">{item.periodType}</div>
            </div>
            <div>
              <div className="history-label">전환일</div>
              <div className="history-value">{item.convertDate || "-"}</div>
            </div>
            <div>
              <div className="history-label">인정일수</div>
              <div className="history-value">{item.recognizedDays}일</div>
            </div>
            <div>
              <div className="history-label">새 만료일</div>
              <div className="history-value">{item.newExpiry || "-"}</div>
            </div>
            <div>
              <div className="history-label">저장일시</div>
              <div className="history-value text-sm">{item.savedAt || "-"}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={downloadingId === item.id}
                onClick={async (event) => {
                  event.stopPropagation();
                  setDownloadingId(item.id);
                  try {
                    await downloadConversionPdf(item);
                  } catch {
                    window.alert("PDF 파일을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
                  } finally {
                    setDownloadingId(null);
                  }
                }}
                className="history-action"
              >
                {downloadingId === item.id ? "생성 중" : "PDF"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(item.id);
                }}
                className="history-action history-action-danger"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
