import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "OGQ — 책 속 세계가 살아납니다",
    template: "%s | OGQ",
  },
  description: "김영사의 책들을 AI 캐릭터와 함께 탐험하고, 나만의 독서 세계를 만들어보세요",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "OGQ — 책 속 세계가 살아납니다",
    description: "김영사의 책들을 AI 캐릭터와 함께 탐험하고, 나만의 독서 세계를 만들어보세요",
    type: "website",
    siteName: "OGQ",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OGQ — 책 속 세계가 살아납니다",
    description: "김영사의 책들을 AI 캐릭터와 함께 탐험하고, 나만의 독서 세계를 만들어보세요",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
