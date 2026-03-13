import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "MetaBook",
  description: "책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "MetaBook",
    description: "책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaBook",
    description: "책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼",
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
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
