import type { Metadata } from "next";
import "./globals.css";
import { Lotus } from "./components/Icon";

export const metadata: Metadata = {
  title: "회원권 계산기",
  description: "아쉬탕가 요가 스튜디오 회원권 환불 및 전환 계산 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="app-header sticky top-0 z-10 px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center gap-4">
            <div className="lotus-mark shrink-0">
              <Lotus className="h-8 w-8" />
            </div>
            <div className="py-0.5">
              <div className="brand-kicker">ASHTANGA YOGA STUDIO</div>
              <div className="mt-1 text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">
                회원권 계산기
              </div>
              <div className="mt-1 text-[0.92rem] font-medium text-teal-100/75">
                환불과 회원 전환을 정확하고 차분하게 관리합니다.
              </div>
            </div>
          </div>
        </header>
        {children}
        <footer className="mt-auto w-full px-5 pb-8 pt-5 sm:px-8">
          <div className="mx-auto max-w-[1400px] text-center">
            <div className="inline-flex items-center gap-3 text-sm text-teal-100/55">
              <span className="h-px w-8 bg-teal-200/25" />
              ASHTANGA YOGA STUDIO
              <span className="h-px w-8 bg-teal-200/25" />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
