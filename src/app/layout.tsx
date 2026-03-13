import type { Metadata } from "next";
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
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaBook",
    description: "책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼",
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
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
