"use client";

import { useEffect, useState } from "react";
import { formatWon } from "./utils";

type Item = {
  id: string;
  name: string;
  requestDate: string;
  refund: number;
  savedAt: string;
};

export default function RecentHistory({ storageKey = "refund_history" }: { storageKey?: string }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    function loadItems() {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    }

    loadItems();
    window.addEventListener("refund-history-updated", loadItems);
    return () => window.removeEventListener("refund-history-updated", loadItems);
  }, [storageKey]);

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
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
        {items.slice(0, 5).map((it) => (
          <li key={it.id} className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <div>
              <div className="history-label">회원 이름</div>
              <div className="mt-1 font-semibold text-gray-900">{it.name || "-"}</div>
            </div>
            <div>
              <div className="history-label">환불 요청일</div>
              <div className="mt-1 font-semibold text-gray-900">{it.requestDate || "-"}</div>
            </div>
            <div>
              <div className="history-label">환불금 · 저장일시</div>
              <div className="mt-1 font-semibold text-gray-900">{formatWon(it.refund)}</div>
              <div className="mt-1 text-sm font-medium text-gray-700">{it.savedAt}</div>
            </div>
            <div>
              <button
                onClick={() => remove(it.id)}
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
