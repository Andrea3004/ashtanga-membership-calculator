import type { Metadata } from "next";
import "./globals.css";
import { Lotus } from "./components/Icon";

export const metadata: Metadata = {
  title: "회원권 계산기",
  description: "정확한 계산으로 더 나은 서비스를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="app-header sticky top-0 z-10 px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center gap-4">
            <div className="lotus-mark shrink-0">
              <Lotus className="h-8 w-8" />
            </div>
            <div className="py-0.5">
              <div className="brand-kicker">ASHTANGA YOGA STUDIO</div>
              <div className="mt-1 text-2xl font-bold tracking-[-0.035em] text-gray-900 sm:text-3xl">
                회원권 계산기
              </div>
              <div className="mt-1 text-[0.95rem] font-medium text-gray-700">
                정확한 계산으로 더 나은 서비스를 제공합니다.
              </div>
            </div>
          </div>
        </header>
        {children}
        <footer className="mt-auto w-full px-5 pb-8 pt-4 sm:px-8">
          <div className="mx-auto max-w-[1400px] text-center">
            <div className="inline-flex items-center gap-3 text-sm text-stone-500">
              <span className="h-px w-8 bg-rose-200" />
              오늘의 작은 수련이 내일의 큰 변화를 만듭니다.
              <span className="h-px w-8 bg-rose-200" />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
