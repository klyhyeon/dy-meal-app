import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "식단 기록",
  description: "두 사람이 함께 쓰는 식단 기록 앱"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
