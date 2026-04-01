import { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUserAdmin } from "./firestore-admin";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.id && user.email && user.name) {
        try {
          await upsertUserAdmin({ id: user.id, email: user.email, name: user.name, image: user.image ?? "" });
        } catch (e) { console.error("upsertUser failed", e); }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
