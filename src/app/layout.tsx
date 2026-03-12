import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "MetaBook — 살아있는 독서 경험",
  description:
    "AI 캐릭터와 대화하고, 책 속 세계를 탐험하고, 독자 커뮤니티를 만나보세요.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "MetaBook",
    description:
      "AI 캐릭터와 대화하고, 책 속 세계를 탐험하고, 독자 커뮤니티를 만나보세요.",
    images: ["/og-thumbnail.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaBook",
    description:
      "AI 캐릭터와 대화하고, 책 속 세계를 탐험하고, 독자 커뮤니티를 만나보세요.",
    images: ["/og-thumbnail.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
