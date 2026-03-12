import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // 어드민 페이지는 로그인 필수
    if (pathname.startsWith("/admin")) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // QR 진입 (/library/[bookId])은 프리뷰 허용
        if (pathname.match(/^\/library\/[^/]+$/) && !pathname.includes("/admin")) {
          return true;
        }

        // /library 목록은 로그인 필수
        if (pathname === "/library") {
          return !!token;
        }

        // /admin은 로그인 필수
        if (pathname.startsWith("/admin")) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/library", "/library/:path*", "/admin/:path*"],
};
